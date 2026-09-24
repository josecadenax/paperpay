import { describe, it, expect } from 'vitest';
import { encodeBase64Json, decodeBase64Json } from '../../src/utils/base64';

describe('Base64 Utilities', () => {
  it('should correctly encode and decode a JSON object', () => {
    const original = {
      scheme: 'exact',
      amount: '5000000',
      network: 'stellar:testnet',
      nested: {
        active: true,
        count: 42,
      },
    };

    const encoded = encodeBase64Json(original);
    expect(typeof encoded).toBe('string');
    expect(encoded).not.toContain('{');

    const decoded = decodeBase64Json<typeof original>(encoded);
    expect(decoded).toEqual(original);
  });

  it('should handle UTF-8 characters correctly in base64', () => {
    const textWithAccents = {
      title: 'Nanotecnología y Computación Cuántica en la UNAM',
      symbols: '© € $ £ 🚀',
    };

    const encoded = encodeBase64Json(textWithAccents);
    const decoded = decodeBase64Json<typeof textWithAccents>(encoded);
    expect(decoded).toEqual(textWithAccents);
  });

  it('should throw an error when decoding invalid JSON', () => {
    const invalidBase64 = Buffer.from('this is not json').toString('base64');
    expect(() => decodeBase64Json(invalidBase64)).toThrow();
  });
});
