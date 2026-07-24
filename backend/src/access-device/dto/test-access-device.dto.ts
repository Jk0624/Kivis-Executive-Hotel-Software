import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class TestAccessDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}