import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AuthMode } from '../enums/auth-mode.enum';

export class VerifyOtpDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0\d{9}$/, {
    message: 'Phone number must be a valid Ghanaian number.',
  })
  phone!: string;

  @IsString()
  @Length(6, 6)
  otp!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsEnum(AuthMode)
  mode!: AuthMode;
}