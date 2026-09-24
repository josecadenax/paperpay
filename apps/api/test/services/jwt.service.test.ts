import { describe, it, expect } from 'vitest';
import { jwtService } from '../../src/services/jwt.service';

describe('JwtService', () => {
  const samplePayload = {
    sub: 'GB6XDEMOLECTORUNAMWALLETTESTNET1234567890',
    paperId: 'autonomous-ai-micropayments',
    txHash: 'tx_hash_123456789abcdef',
  };

  it('should issue a valid JWT token', () => {
    const token = jwtService.issueAccessToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
  });

  it('should verify a valid token and return correct claims', () => {
    const token = jwtService.issueAccessToken(samplePayload);
    const claims = jwtService.verifyAccessToken(token);

    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe(samplePayload.sub);
    expect(claims?.paperId).toBe(samplePayload.paperId);
    expect(claims?.txHash).toBe(samplePayload.txHash);
    expect(claims?.exp).toBeDefined();
    expect(claims?.iat).toBeDefined();
  });

  it('should return null for a tampered or invalid token', () => {
    const token = jwtService.issueAccessToken(samplePayload);
    const tampered = token.slice(0, -5) + 'xxxxx';

    const claims = jwtService.verifyAccessToken(tampered);
    expect(claims).toBeNull();
  });

  it('should return null for a completely random string', () => {
    const claims = jwtService.verifyAccessToken('not-a-valid-jwt-token');
    expect(claims).toBeNull();
  });
});
