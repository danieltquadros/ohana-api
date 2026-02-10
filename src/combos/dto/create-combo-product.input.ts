import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateComboProductInput {
  @Field(() => Int)
  @IsInt()
  comboId: number;

  @Field(() => Int)
  @IsInt()
  productId: number;

  @Field(() => Int)
  @IsInt()
  quantity: number;

  @Field(() => Int)
  @IsInt()
  order: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;
}
