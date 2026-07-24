import * as crypto from 'crypto';

// ==========================================
// OTP GENERATION
// ==========================================
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==========================================
// OTP HASHING
// ==========================================
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// ==========================================
// OTP HASH VERIFICATION
// ==========================================
export function verifyOtpHash(
  otp: string,
  storedHash: string,
): boolean {
  return hashOtp(otp) === storedHash;
}

/**
 * Compare raw OTP with stored hash
 */
export function compareOtp(otp: string, hash: string): boolean {
  const hashedOtp = hashOtp(otp);
  return hashedOtp === hash;
}