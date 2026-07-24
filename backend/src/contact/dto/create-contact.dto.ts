import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MaxLength(150)
  subject!: string;

  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}