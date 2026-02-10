import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ComboProduct {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  comboId: number;

  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  order: number;

  @Field()
  isCustomizable: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
