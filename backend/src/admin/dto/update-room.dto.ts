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
// UPDATE ROOM DTO
// ==========================================
export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  roomNo?: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({
    each: true,
  })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl(
    {},
    {
      each: true,
    },
  )
  photos?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({
    each: true,
  })
  photoPublicIds?: string[];

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}