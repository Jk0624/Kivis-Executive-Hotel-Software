import * as crypto from 'crypto';

// ==========================================
// GENERATE ACCESS DEVICE API KEY
// ==========================================
export function generateApiKey(): string {
  return `kiviz_ad_${crypto.randomBytes(12).toString('hex')}`;
}