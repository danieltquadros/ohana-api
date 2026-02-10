import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateComboProductSubstitutionInput {
  @Field(() => Int)
  @IsInt()
  comboProductId: number;

  @Field(() => Int)
  @IsInt()
  substituteProductId: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  extraCost?: number;
}
