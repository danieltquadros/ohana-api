import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateProductIngredientInput } from './create-product-ingredient.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateProductIngredientInput extends PartialType(
  CreateProductIngredientInput,
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
