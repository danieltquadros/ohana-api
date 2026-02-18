import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, {
    message: 'Phone must be in format: (XX) XXXXX-XXXX',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, {
    message: 'CPF must be in format: XXX.XXX.XXX-XX',
  })
  cpf?: string;
}
