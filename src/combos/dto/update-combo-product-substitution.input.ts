import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateComboProductSubstitutionInput } from './create-combo-product-substitution.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateComboProductSubstitutionInput extends PartialType(
  CreateComboProductSubstitutionInput,
) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
