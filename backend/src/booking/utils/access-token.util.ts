import { randomBytes } from 'crypto';

// ==========================================
// GENERATE ACCESS TOKEN
// ==========================================
export function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}