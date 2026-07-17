import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DayOfWeek, OfferKind, OfferScope } from '@prisma/client';

export class CreateOfferDto {
  @IsString()
  label!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(OfferKind)
  kind!: OfferKind;

  @IsEnum(OfferScope)
  scope!: OfferScope;

  @IsNumber()
  @IsOptional()
  percentage?: number;

  @IsNumber()
  @IsOptional()
  fixedAmount?: number;

  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  maxDiscountValue?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  validUntil?: Date;

  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[];

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  stackable?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Targets — listas de IDs do scope correspondente
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  comboIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  productTypeIds?: number[];
}
