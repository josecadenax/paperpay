import { describe, expect, it } from 'vitest';
import { isUnsafeJwtSecret } from '../src/config';

describe('isUnsafeJwtSecret', () => {
  it('rejects a missing or short secret', () => {
    expect(isUnsafeJwtSecret(undefined)).toBe(true);
    expect(isUnsafeJwtSecret('')).toBe(true);
    expect(isUnsafeJwtSecret('a'.repeat(31))).toBe(true);
  });

  it('rejects the default and example secrets published in the repository', () => {
    expect(isUnsafeJwtSecret('paperpay_hackathon_goya_2026_default_secret_key')).toBe(true);
    expect(isUnsafeJwtSecret('paperpay_jwt_secret_goya_hack_2026_super_secure')).toBe(true);
    expect(isUnsafeJwtSecret('super-secreto-para-el-hackathon-goya-2026')).toBe(true);
    expect(isUnsafeJwtSecret('paperpay_jwt_secret_goya_hack_2026_1790000000000')).toBe(true);
  });

  it('accepts a long random secret', () => {
    expect(isUnsafeJwtSecret('3f9c1b7e5a2d4c6f8e0a1b3c5d7e9f1a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e')).toBe(false);
  });
});
