import { IsString } from 'class-validator';

// ==========================================
// RESEND ACCESS PIN DTO
// ==========================================
export class ResendAccessPinDto {
  @IsString()
  bookingId!: string;
}