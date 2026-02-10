import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

@InputType()
export class CreateComboInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  image: string;

  @Field(() => Float)
  @IsNumber()
  price: number;

  @Field(() => Int)
  @IsInt()
  order: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  validFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  validUntil?: Date;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  discount?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;
}
