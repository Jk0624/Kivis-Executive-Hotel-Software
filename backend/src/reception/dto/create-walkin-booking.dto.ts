import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

// ==========================================
// CREATE WALK-IN BOOKING DTO
// ==========================================
export class CreateWalkInBookingDto {
  @IsPhoneNumber('GH')
  phone!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  roomNo!: string;

  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @IsNumber()
  amount!: number;
}