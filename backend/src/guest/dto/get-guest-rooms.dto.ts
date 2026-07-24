import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  RoomStatus,
  RoomType,
} from '@prisma/client';

export class GetGuestRoomsDto {
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
}