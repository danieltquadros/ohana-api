import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateProductTypeInput } from './create-product-type.input';

@InputType()
export class UpdateProductTypeInput extends PartialType(
  CreateProductTypeInput,
) {
  @Field(() => Int)
  id: number;
}
