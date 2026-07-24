import { IsString } from 'class-validator';

export class CheckInDto {
  @IsString()
  bookingReference!: string;
}