import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductIngredientDto {
  @IsInt()
  ingredientId!: number;

  @IsInt()
  quantity!: number;

  @IsInt()
  order!: number;
}

export class CreateProductDto {
  @IsString()
  title!: string;

  @IsString()
  image!: string;

  @IsNumber()
  price!: number;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  productTypeId!: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductIngredientDto)
  @IsOptional()
  ingredients?: ProductIngredientDto[];
}
