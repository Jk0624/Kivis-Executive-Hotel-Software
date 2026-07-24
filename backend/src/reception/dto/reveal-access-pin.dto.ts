import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

// ==========================================
// REVEAL ACCESS PIN DTO
// ==========================================
export class RevealAccessPinDto {

  @IsString()
  @IsNotEmpty()
  bookingId!: string;

}