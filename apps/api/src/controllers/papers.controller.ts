import { Request, Response } from 'express';
import {
  HealthCheckResponse,
  STELLAR_NETWORK,
  X402_HEADERS,
  X402PaymentResponseHeader,
} from '@paperpay/shared';
import { config } from '../config';
import { jwtService } from '../services/jwt.service';
import { papersService } from '../services/papers.service';
import { x402Service } from '../services/x402.service';
import { encodeBase64Json } from '../utils/base64';

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
}

export const papersController = new PapersController();
