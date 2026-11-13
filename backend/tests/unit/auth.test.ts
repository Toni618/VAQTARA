import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, hashToken } from '../../src/lib/auth.js';

describe('auth utils', () => {
  it('hashes and verifies passwords with argon2', async () => {
    const hash = await hashPassword('StrongPass123!test');
    expect(hash).not.toBe('StrongPass123!test');
    await expect(verifyPassword(hash, 'StrongPass123!test')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false);
  });

  it('hashes tokens deterministically with sha256 hex', () => {
    const a = hashToken('token-value');
    const b = hashToken('token-value');
    const c = hashToken('different');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});
