import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { CategoryType } from '../../common/enums/category-type.enum';

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
