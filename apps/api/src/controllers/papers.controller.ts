import { Request, Response } from 'express';
import {
  HealthCheckResponse,
  STELLAR_NETWORK,
  X402_HEADERS,
  X402PaymentResponseHeader,
  X402PaymentVerificationHeader,
} from '@paperpay/shared';
import { config } from '../config';
import { jwtService } from '../services/jwt.service';
import { papersService } from '../services/papers.service';
import { x402Service } from '../services/x402.service';
import { paymentVerificationService, PaymentVerificationError } from '../services/payment-verification.service';
import { decodeBase64Json, encodeBase64Json } from '../utils/base64';

export class PapersController {
  public getHealth(_req: Request, res: Response): void {
    const health: HealthCheckResponse = {
      status: 'ok',
      network: STELLAR_NETWORK,
      mode: config.selfSettle ? 'SELF_SETTLE' : 'FACILITATOR',
      treasuryPublicKey: config.stellarTreasuryPublicKey,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(health);
  }

  public getPaperList(_req: Request, res: Response): void {
    const previews = papersService.getAllPreviews();
    res.status(200).json(previews);
  }

  public async getPaperById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const paper = papersService.getPaperById(id);

    if (!paper) {
      res.status(404).json({
        error: 'PAPER_NOT_FOUND',
        message: `El artículo con ID '${id}' no existe en el catálogo.`,
      });
      return;
    }

    // 1. Verificación de JWT previo (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const claims = jwtService.verifyAccessToken(token);

      if (claims && claims.paperId === id) {
        // Acceso autorizado por sesión previa
        res.status(200).json({ paper });
        return;
      }
    }

    // 2. Verificación de cabecera PAYMENT-SIGNATURE (Protocolo x402 v2)
    const rawSignatureHeader = req.headers[X402_HEADERS.PAYMENT_SIGNATURE] as string | undefined;

    if (rawSignatureHeader) {
      try {
        const signaturePayload = x402Service.parseSignatureHeader(rawSignatureHeader);
        const settlement = await x402Service.settlePayment(signaturePayload, id);

        if (settlement.success) {
          // Generar token JWT de acceso por 24 horas
          const accessToken = jwtService.issueAccessToken({
            sub: signaturePayload.signerPublicKey,
            paperId: id,
            txHash: settlement.txHash,
          });

          // Cabecera de respuesta estándar PAYMENT-RESPONSE
          const paymentResponsePayload: X402PaymentResponseHeader = {
            success: true,
            txHash: settlement.txHash,
            settledAt: new Date().toISOString(),
          };

          res.setHeader(
            X402_HEADERS.PAYMENT_RESPONSE,
            encodeBase64Json(paymentResponsePayload)
          );

          res.status(200).json({
            paper,
            accessToken,
            txHash: settlement.txHash,
          });
          return;
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[PapersController] Error durante la liquidación:', errorMsg);

        res.status(402).json({
          error: 'PAYMENT_FAILED',
          message: errorMsg,
        });
        return;
      }
    }

    // 3. Flujo por defecto: Paywall HTTP 402 Stateless
    const requirement = x402Service.createPaymentRequirement(paper.id, paper.title);
    const requirementBase64 = encodeBase64Json(requirement);

    // Cabecera estándar del protocolo
    res.setHeader(X402_HEADERS.PAYMENT_REQUIRED, requirementBase64);

    // Solo se envía el preview, NUNCA el texto completo ni el PDF
    const preview = papersService.getPaperPreviewById(id);
    res.status(402).json({
      preview,
    });
  }

  public async verifyPaperByHash(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const paper = papersService.getPaperById(id);
    if (!paper) {
      res.status(404).json({
        error: 'PAPER_NOT_FOUND',
        message: `El artículo con ID '${id}' no existe en el catálogo.`,
      });
      return;
    }

    try {
      const body = req.body as Partial<X402PaymentVerificationHeader>;
      if (typeof body.txHash !== 'string' || typeof body.signerPublicKey !== 'string') {
        throw new PaymentVerificationError(400, 'El cuerpo debe incluir txHash y signerPublicKey.');
      }

      const header = this.parseVerificationHeader(req.headers[X402_HEADERS.PAYMENT_SIGNATURE] as string | undefined);
      if (
        header.txHash !== body.txHash ||
        header.signerPublicKey !== body.signerPublicKey ||
        header.scheme !== 'exact' ||
        header.network !== STELLAR_NETWORK
      ) {
        throw new PaymentVerificationError(400, 'La cabecera PAYMENT-SIGNATURE no coincide con el pago a verificar.');
      }

      const payment = await paymentVerificationService.verifyByHash({
        txHash: body.txHash,
        signerPublicKey: body.signerPublicKey,
        paperId: id,
      });
      const accessToken = jwtService.issueAccessToken({
        sub: payment.signerPublicKey,
        paperId: id,
        txHash: payment.txHash,
      });
      const paymentResponse: X402PaymentResponseHeader = {
        success: true,
        txHash: payment.txHash,
        settledAt: new Date().toISOString(),
      };
      res.setHeader(X402_HEADERS.PAYMENT_RESPONSE, encodeBase64Json(paymentResponse));
      res.status(200).json({ paper, accessToken, txHash: payment.txHash });
    } catch (err: unknown) {
      const error = err instanceof PaymentVerificationError
        ? err
        : new PaymentVerificationError(400, 'Solicitud de verificación de pago inválida.');
      res.status(error.status).json({
        error: error.status === 409 ? 'PAYMENT_ALREADY_USED' : 'PAYMENT_VERIFICATION_FAILED',
        message: error.message,
      });
    }
  }

  private parseVerificationHeader(rawHeader: string | undefined): X402PaymentVerificationHeader {
    if (!rawHeader) {
      throw new PaymentVerificationError(400, 'Falta la cabecera PAYMENT-SIGNATURE con el hash de la transacción.');
    }
    try {
      return decodeBase64Json<X402PaymentVerificationHeader>(rawHeader);
    } catch {
      try {
        return JSON.parse(rawHeader) as X402PaymentVerificationHeader;
      } catch {
        throw new PaymentVerificationError(400, 'Formato de cabecera PAYMENT-SIGNATURE inválido.');
      }
    }
  }
}

export const papersController = new PapersController();
