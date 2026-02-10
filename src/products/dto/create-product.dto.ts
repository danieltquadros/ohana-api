import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsNumber()
  price: number;

  @IsInt()
  order: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  productTypeId: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}
