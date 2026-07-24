import {
  IsDateString,
  IsString,
} from 'class-validator';

// ==========================================
// CREATE BOOKING DTO
// ==========================================
export class CreateBookingDto {
  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @IsString()
  roomId!: string;
}