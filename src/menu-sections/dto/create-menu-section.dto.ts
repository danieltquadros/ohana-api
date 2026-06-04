import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { MenuSectionKind } from '@prisma/client';

export class CreateMenuSectionDto {
  @IsString()
  label!: string;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(MenuSectionKind)
  kind!: MenuSectionKind;

  @IsInt()
  @IsOptional()
  productTypeId?: number;
}
