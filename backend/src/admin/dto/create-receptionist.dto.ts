import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateReceptionistDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @Matches(/^0\d{9}$/)
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  employeeId!: string;
}