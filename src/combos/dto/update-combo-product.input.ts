import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateComboProductInput } from './create-combo-product.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateComboProductInput extends PartialType(
  CreateComboProductInput,
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
