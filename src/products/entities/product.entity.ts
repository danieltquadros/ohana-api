import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ProductType } from '../../product-types/entities/product-type.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductIngredient } from './product-ingredient.entity';

@ObjectType()
export class Product {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  image!: string;

  @Field(() => Float)
  price!: number;

  @Field(() => Int)
  order!: number;

  @Field()
  isActive!: boolean;

  @Field(() => Int)
  productTypeId!: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Int, { nullable: true })
  createdBy?: number;

  @Field(() => Int, { nullable: true })
  updatedBy?: number;

  @Field(() => ProductType)
  type!: ProductType;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [ProductIngredient])
  ingredients!: ProductIngredient[];
}
