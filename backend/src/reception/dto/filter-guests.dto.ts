import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

// ==========================================
// FILTER GUESTS DTO
// ==========================================
export class FilterGuestsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}