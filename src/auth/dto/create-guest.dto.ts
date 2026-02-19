import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para criar usuário GUEST no checkout rápido
 * Apenas telefone e nome são obrigatórios
 * Não requer email nem senha
 */
export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/, {
    message: 'Phone must be in format: (XX) XXXXX-XXXX',
  })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName!: string;
}
