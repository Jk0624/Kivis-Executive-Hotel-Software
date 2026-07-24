import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class MarkRoomMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}