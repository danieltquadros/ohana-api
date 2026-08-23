import { CategoryType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  label!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CategoryType)
  type!: CategoryType;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
