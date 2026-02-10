import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateComboInput } from './create-combo.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateComboInput extends PartialType(CreateComboInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
