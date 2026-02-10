import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Combo {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  image: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => Date, { nullable: true })
  validFrom?: Date;

  @Field(() => Date, { nullable: true })
  validUntil?: Date;

  @Field(() => Float, { nullable: true })
  discount?: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  createdBy?: number;

  @Field(() => Int, { nullable: true })
  updatedBy?: number;
}
