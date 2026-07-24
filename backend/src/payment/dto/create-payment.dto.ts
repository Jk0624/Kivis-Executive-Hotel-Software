import { IsString } from 'class-validator';

// ==========================================
// CREATE PAYMENT DTO
// ==========================================
export class CreatePaymentDto {
  @IsString()
  bookingId!: string;
}