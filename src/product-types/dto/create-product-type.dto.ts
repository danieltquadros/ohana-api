import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  name: string;

  @IsInt()
  order: number; // Obrigatório

  @IsBoolean()
  @IsOptional() // Opcional porque tem default no banco
  inUse?: boolean;
}
