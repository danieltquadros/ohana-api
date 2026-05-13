import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ComboProductDto {
  @IsInt()
  productId!: number;

  @IsInt()
  quantity!: number;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;
}

export class CreateComboDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  image!: string;

  @IsNumber()
  price!: number;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboProductDto)
  @IsOptional()
  products?: ComboProductDto[];
}
