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
export class ProductIngredientInput {
  @Field(() => Int)
  @IsInt()
  ingredientId!: number;

  @Field(() => Int)
  @IsInt()
  quantity!: number;

  @Field(() => Int)
  @IsInt()
  order!: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  title!: string;

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

  @Field(() => Int)
  @IsInt()
  productTypeId!: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field(() => [ProductIngredientInput], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductIngredientInput)
  @IsOptional()
  ingredients?: ProductIngredientInput[];
}
