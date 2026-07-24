import { IsString } from 'class-validator';

export class VerifyAccessDto {
  @IsString()
  pin!: string;
}