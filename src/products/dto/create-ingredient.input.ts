import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt } from 'class-validator';

@InputType()
export class CreateIngredientInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  quantity: number;
}
