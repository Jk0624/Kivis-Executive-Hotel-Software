import {
  IsDateString,
  IsString,
} from 'class-validator';

export class PreviewBookingExtensionDto {
  @IsString()
  bookingReference!: string;

  @IsDateString()
  newCheckOutDate!: string;
}