import argon2 from 'argon2';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateIdempotencyKey(prefix = 'evt'): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
