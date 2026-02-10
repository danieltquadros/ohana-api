import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class ComboProductSubstitution {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  comboProductId: number;

  @Field(() => Int)
  substituteProductId: number;

  @Field(() => Float, { nullable: true })
  extraCost?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
