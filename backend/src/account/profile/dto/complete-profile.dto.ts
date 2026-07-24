import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

// ==========================================
// COMPLETE PROFILE DTO
// ==========================================
export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;
}