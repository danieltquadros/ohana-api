import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateProductTypeInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsInt()
  order: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  inUse?: boolean;
}
