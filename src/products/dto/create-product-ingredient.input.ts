import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@InputType()
export class CreateProductIngredientInput {
  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsInt()
  ingredientId: number;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @Field(() => Int)
  @IsInt()
  order: number;
}
