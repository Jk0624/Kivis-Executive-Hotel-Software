import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AuthMode } from '../enums/auth-mode.enum';

export class RequestOtpDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, {
    message: 'Phone must contain only numbers.',
  })
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(AuthMode)
  mode!: AuthMode;
}