import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO para ingredientes (aninhado)
export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsInt()
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsNumber()
  price: number;

  @IsInt()
  order: number;

  @IsInt()
  productTypeId: number; // ID do tipo de produto

  // Lista de ingredientes (opcioanl)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientDto)
  ingredients?: CreateIngredientDto[];
}
