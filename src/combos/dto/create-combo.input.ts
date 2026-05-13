import { InputType, Field, Int, Float } from '@nestjs/graphql';
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

@InputType()
export class ComboProductInput {
  @Field(() => Int)
  @IsInt()
  productId!: number;

  @Field(() => Int)
  @IsInt()
  quantity!: number;

  @Field(() => Int)
  @IsInt()
  order!: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;
}

@InputType()
export class CreateComboInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  image!: string;

  @Field(() => Float)
  @IsNumber()
  price!: number;

  @Field(() => Int)
  @IsInt()
  order!: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  validFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  validUntil?: Date;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field(() => [ComboProductInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComboProductInput)
  @IsOptional()
  products?: ComboProductInput[];
}
