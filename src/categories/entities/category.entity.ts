import { ObjectType, Field, Int } from '@nestjs/graphql';
import { CategoryType } from '../../common/enums/category-type.enum';

@ObjectType()
export class Category {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => CategoryType)
  type: CategoryType;

  @Field(() => Int)
  order: number;

  @Field()
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Int, { nullable: true })
  createdBy?: number;

  @Field(() => Int, { nullable: true })
  updatedBy?: number;
}
