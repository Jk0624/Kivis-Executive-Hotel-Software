import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { RoomType } from '@prisma/client';

// ==========================================
// CREATE ROOM DTO
// ==========================================
export class CreateRoomDto {
  @IsString()
  roomNo!: string;

  @IsEnum(RoomType)
  type!: RoomType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({
    each: true,
  })
  amenities!: string[];

  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl(
    {},
    {
      each: true,
    },
  )
  photos!: string[];

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({
    each: true,
  })
  photoPublicIds!: string[];

  @IsNumber()
  @IsPositive()
  price!: number;
}