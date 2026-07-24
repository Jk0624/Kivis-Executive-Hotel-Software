import { IsString } from 'class-validator';

// ==========================================
// REGISTER ACCESS DEVICE DTO
// ==========================================
export class RegisterAccessDeviceDto {
  @IsString()
  deviceId!: string;

  @IsString()
  roomNo!: string;
}