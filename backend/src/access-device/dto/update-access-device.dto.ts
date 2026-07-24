import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAccessDeviceDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  roomNo?: string;
}