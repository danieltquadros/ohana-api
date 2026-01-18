import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Ingredient {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  productId: number;
}
