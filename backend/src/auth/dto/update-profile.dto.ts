import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

// ==========================================
// UPDATE PROFILE DTO
// ==========================================
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}