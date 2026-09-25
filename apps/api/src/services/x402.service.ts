import {
  DEFAULT_PAPER_PRICE_STROOPS,
  STELLAR_NETWORK,
  USDC_TESTNET_CONTRACT,
  X402PaymentRequiredHeader,
  X402PaymentSignatureHeader,
} from '@paperpay/shared';
import { config } from '../config';
import { decodeBase64Json } from '../utils/base64';

export class X402Service {
  public createPaymentRequirement(paperId: string, title: string): X402PaymentRequiredHeader {
    return {
      accepts: [
        {
          scheme: 'exact',
          network: STELLAR_NETWORK,
          asset: USDC_TESTNET_CONTRACT,
          amount: DEFAULT_PAPER_PRICE_STROOPS, // '5000000' = 0.50 USDC
          payTo: config.stellarTreasuryPublicKey,
          maxTimeoutSeconds: 300,
          extra: {
            paperId,
            title,
          },
        },
      ],
    };
  }

  public parseSignatureHeader(rawHeader: string): X402PaymentSignatureHeader {
    try {
      // Intentar primero como Base64
      return decodeBase64Json<X402PaymentSignatureHeader>(rawHeader);
    } catch {
      try {
        // Intentar como JSON plano
        return JSON.parse(rawHeader) as X402PaymentSignatureHeader;
      } catch {
        throw new Error('Formato de cabecera PAYMENT-SIGNATURE inválido. Debe ser JSON o Base64.');
      }
    }
  }

  public async settlePayment(
    signaturePayload: X402PaymentSignatureHeader,
    paperId: string
  ): Promise<{ success: boolean; txHash: string }> {
    if (signaturePayload.scheme !== 'exact' || signaturePayload.network !== STELLAR_NETWORK ||
        !signaturePayload.signature || !signaturePayload.signerPublicKey) {
      throw new Error('Firma o clave pública del lector no proporcionada en la cabecera.');
    }

    const isPlaceholder = signaturePayload.signature === 'unsigned-demo-signature' ||
      signaturePayload.signature.startsWith('mock_') ||
      signaturePayload.signature.startsWith('demo_');
    if (isPlaceholder) {
      if (!config.demoPayments) throw new Error('Los pagos simulados están deshabilitados.');
      return { success: true, txHash: `mock_tx_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}` };
    }

    console.log(`[x402Service] Iniciando liquidación para paper ${paperId} desde wallet ${signaturePayload.signerPublicKey}`);

    // Modo 1: SELF_SETTLE (Fallback con cuenta operativa del backend)
    if (config.selfSettle) {
      return this.selfSettle(signaturePayload, paperId);
    }

    // Modo 2: Facilitador OpenZeppelin Channels
    try {
      return await this.settleViaOpenZeppelin(signaturePayload, paperId);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[x402Service] Facilitador de OpenZeppelin falló o no disponible: ${errorMsg}`);

      throw new Error(`Error en facilitador x402: ${errorMsg}`);
    }
  }

  private async settleViaOpenZeppelin(
    payload: X402PaymentSignatureHeader,
    paperId: string
  ): Promise<{ success: boolean; txHash: string }> {
    const response = await fetch(config.openZeppelinChannelsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.openZeppelinApiKey,
      },
      body: JSON.stringify({
        scheme: 'exact',
        network: STELLAR_NETWORK,
        signature: payload.signature,
        signer: payload.signerPublicKey,
        asset: USDC_TESTNET_CONTRACT,
        amount: DEFAULT_PAPER_PRICE_STROOPS,
        payTo: config.stellarTreasuryPublicKey,
        metadata: { paperId },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenZeppelin Channels HTTP ${response.status}: ${errorBody}`);
    }

    const result = (await response.json()) as { success?: boolean; txHash?: string };
    if (result.success !== true || !result.txHash || !/^[0-9a-f]{64}$/i.test(result.txHash)) {
      throw new Error('El facilitador no confirmó una transacción válida.');
    }
    return {
      success: true,
      txHash: result.txHash,
    };
  }

  private async selfSettle(
    payload: X402PaymentSignatureHeader,
    _paperId: string
  ): Promise<{ success: boolean; txHash: string }> {
    console.log('[x402Service] Evaluando liquidación en modo SELF_SETTLE...');
    
    const { Transaction, Networks, Horizon } = await import('@stellar/stellar-sdk');
    
    let tx;
    try {
      tx = new Transaction(payload.signature, Networks.TESTNET);
    } catch {
      throw new Error('El campo signature no es un XDR de transacción válido.');
    }
    if (tx.source !== payload.signerPublicKey) {
      throw new Error('La wallet firmante no coincide con el origen de la transacción.');
    }

    // Validación de seguridad para MVP: asegurar que la transacción paga a nuestra tesorería, en USDC, y el monto es 0.50
    let isValidPayment = false;
    const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

    for (const op of tx.operations) {
      if (op.type === 'payment' && (!op.source || op.source === payload.signerPublicKey) &&
          op.destination === config.stellarTreasuryPublicKey) {
        // En stellar-sdk, amount viene como string decimal (ej. "0.5000000")
        const amount = Number(op.amount);
        const isUSDC = op.asset && !op.asset.isNative() && op.asset.code === 'USDC' && op.asset.issuer === USDC_ISSUER;
        
        if (isUSDC && amount >= 0.5) {
          isValidPayment = true;
          break;
        }
      }
    }

    if (!isValidPayment) {
      throw new Error('La transacción no contiene un pago válido (0.50 USDC) hacia la tesorería de PaperPay.');
    }

    const server = new Horizon.Server('https://horizon-testnet.stellar.org');
    
    try {
      const response = await server.submitTransaction(tx);
      console.log(`✅ Transacción confirmada en Testnet! Hash: ${response.hash}`);
      return {
        success: true,
        txHash: response.hash,
      };
    } catch (err: any) {
      console.error('❌ Error enviando transacción a Horizon:', err.response?.data || err.message);
      throw new Error('Fallo al liquidar la transacción en la red Stellar.');
    }
  }
}

export const x402Service = new X402Service();
