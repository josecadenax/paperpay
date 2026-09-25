import {
  DEFAULT_PAPER_PRICE_STROOPS,
  STELLAR_NETWORK,
  USDC_TESTNET_ISSUER,
} from '@paperpay/shared';
import { config } from '../config';

interface HorizonTransaction {
  successful?: boolean;
  created_at?: string;
  source_account?: string;
}

interface HorizonPaymentOperation {
  type?: string;
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
}

interface HorizonCollection<T> {
  _embedded?: { records?: T[] };
}

export interface VerifiedPayment {
  txHash: string;
  paperId: string;
  signerPublicKey: string;
}

export class PaymentVerificationError extends Error {
  public constructor(
    public readonly status: 400 | 402 | 409 | 502,
    message: string,
  ) {
    super(message);
    this.name = 'PaymentVerificationError';
  }
}

/**
 * Verifies payments submitted by Pollar. Receipts live in memory because this
 * MVP has no database; deploying more than one instance or restarting it loses
 * replay protection. A persistent receipt store is required before production.
 */
export class PaymentVerificationService {
  private readonly receipts = new Map<string, VerifiedPayment>();
  private readonly pending = new Map<string, Promise<VerifiedPayment>>();

  public async verifyByHash(input: VerifiedPayment): Promise<VerifiedPayment> {
    this.validateInput(input);

    const receipt = this.receipts.get(input.txHash);
    if (receipt) return this.requireSameReceipt(receipt, input);

    const inFlight = this.pending.get(input.txHash);
    if (inFlight) {
      return this.requireSameReceipt(await inFlight, input);
    }

    const verification = this.verifyOnHorizon(input)
      .then(() => {
        this.receipts.set(input.txHash, input);
        return input;
      })
      .finally(() => this.pending.delete(input.txHash));

    this.pending.set(input.txHash, verification);
    return verification;
  }

  public clearReceiptsForTests(): void {
    this.receipts.clear();
    this.pending.clear();
  }

  private validateInput(input: VerifiedPayment): void {
    if (!/^[0-9a-f]{64}$/i.test(input.txHash)) {
      throw new PaymentVerificationError(400, 'txHash debe ser un hash Stellar hexadecimal de 64 caracteres.');
    }
    if (!input.paperId || !input.signerPublicKey) {
      throw new PaymentVerificationError(400, 'Se requieren el artículo y la clave pública del firmante.');
    }
  }

  private requireSameReceipt(receipt: VerifiedPayment, input: VerifiedPayment): VerifiedPayment {
    if (receipt.paperId === input.paperId && receipt.signerPublicKey === input.signerPublicKey) {
      return receipt;
    }
    throw new PaymentVerificationError(409, 'Esta transacción ya fue usada para desbloquear otro artículo o firmante.');
  }

  private async verifyOnHorizon(input: VerifiedPayment): Promise<void> {
    const transaction = await this.fetchJson<HorizonTransaction>(`/transactions/${input.txHash}`);
    if (transaction.successful !== true) {
      throw new PaymentVerificationError(402, 'La transacción no fue confirmada correctamente en Stellar.');
    }
    if (transaction.source_account !== input.signerPublicKey) {
      throw new PaymentVerificationError(402, 'El firmante no coincide con el origen de la transacción.');
    }
    this.requireRecent(transaction.created_at);

    const operations = await this.fetchJson<HorizonCollection<HorizonPaymentOperation>>(
      `/transactions/${input.txHash}/operations?limit=200&order=asc`,
    );
    const hasExactPayment = (operations._embedded?.records ?? []).some((operation) => (
      operation.type === 'payment' &&
      operation.from === input.signerPublicKey &&
      operation.to === config.stellarTreasuryPublicKey &&
      operation.asset_type === 'credit_alphanum4' &&
      operation.asset_code === 'USDC' &&
      operation.asset_issuer === USDC_TESTNET_ISSUER &&
      this.isExactPrice(operation.amount)
    ));

    if (!hasExactPayment) {
      throw new PaymentVerificationError(402, 'La transacción no contiene un pago exacto de 0.50 USDC a la tesorería.');
    }
  }

  private requireRecent(createdAt: string | undefined): void {
    const timestamp = Date.parse(createdAt ?? '');
    const maxAgeMilliseconds = config.paymentVerificationMaxAgeSeconds * 1000;
    const age = Date.now() - timestamp;
    if (!Number.isFinite(timestamp) || age < -60_000 || age > maxAgeMilliseconds) {
      throw new PaymentVerificationError(402, 'La transacción no está dentro del periodo de pago permitido.');
    }
  }

  private isExactPrice(amount: string | undefined): boolean {
    if (!amount || !/^\d+(?:\.\d{1,7})?$/.test(amount)) return false;
    const [whole, fraction = ''] = amount.split('.');
    const stroops = BigInt(`${whole}${fraction.padEnd(7, '0')}`);
    return stroops === BigInt(DEFAULT_PAPER_PRICE_STROOPS);
  }

  private async fetchJson<T>(path: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${config.horizonUrl}${path}`);
    } catch {
      throw new PaymentVerificationError(502, 'No fue posible consultar Horizon para verificar el pago.');
    }
    if (response.status === 404) {
      throw new PaymentVerificationError(402, 'No se encontró la transacción en Horizon.');
    }
    if (!response.ok) {
      throw new PaymentVerificationError(502, 'Horizon rechazó la consulta de verificación.');
    }
    return response.json() as Promise<T>;
  }
}

export const paymentVerificationService = new PaymentVerificationService();
