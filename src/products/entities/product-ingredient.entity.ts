import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@ObjectType()
export class ProductIngredient {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  productId!: number;

  @Field(() => Int)
  ingredientId!: number;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Int)
  order!: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Ingredient)
  ingredient!: Ingredient;
}
