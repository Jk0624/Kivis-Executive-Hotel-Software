import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  RoomType,
} from '@prisma/client';

export class FilterGuestRoomsDto {

  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}