import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRATION_HOURS, JWTAccessTokenClaims } from '@paperpay/shared';
import { config } from '../config';

export class JwtService {
  private secret: string;

  constructor() {
    this.secret = config.jwtSecret;
  }

  public issueAccessToken(payload: { sub: string; paperId: string; txHash: string }): string {
    return jwt.sign(
      {
        sub: payload.sub,
        paperId: payload.paperId,
        txHash: payload.txHash,
      },
      this.secret,
      {
        expiresIn: `${ACCESS_TOKEN_EXPIRATION_HOURS}h`,
      }
    );
  }

  public verifyAccessToken(token: string): JWTAccessTokenClaims | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTAccessTokenClaims;
      return decoded;
    } catch {
      return null;
    }
  }
}

export const jwtService = new JwtService();
