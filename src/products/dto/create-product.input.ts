import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIngredientInput } from './create-ingredient.input';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  image: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field(() => Int)
  @IsInt()
  order: number;

  @Field(() => Int)
  @IsInt()
  productTypeId: number;

  @Field(() => [CreateIngredientInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientInput)
  ingredients: CreateIngredientInput[];
}
