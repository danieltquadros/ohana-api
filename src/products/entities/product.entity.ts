import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Ingredient } from './ingredient.entity';
import { ProductType } from '../../product-types/entities/product-type.entity';

@ObjectType()
export class Product {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  image: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Int)
  productTypeId: number;

  @Field(() => ProductType)
  type: ProductType;

  @Field(() => [Ingredient])
  ingredients: Ingredient[];
}
