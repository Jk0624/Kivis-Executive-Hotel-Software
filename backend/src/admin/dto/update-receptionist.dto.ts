import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateReceptionistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber('GH')
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}