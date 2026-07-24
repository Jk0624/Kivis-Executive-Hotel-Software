import {
  IsEmail,
} from 'class-validator';

// ==========================================
// UPDATE EMAIL DTO
// ==========================================
export class UpdateEmailDto {
  @IsEmail()
  email!: string;
}