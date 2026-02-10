import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateIngredientInput } from './create-ingredient.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateIngredientInput extends PartialType(CreateIngredientInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
