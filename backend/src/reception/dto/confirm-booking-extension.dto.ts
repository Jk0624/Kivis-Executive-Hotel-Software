import {
  IsDateString,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class ConfirmBookingExtensionDto {
  @IsString()
  bookingReference!: string;

  @IsDateString()
  newCheckOutDate!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
