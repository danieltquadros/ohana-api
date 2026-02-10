import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { CategoryType } from '../../common/enums/category-type.enum';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => CategoryType)
  @IsEnum(CategoryType)
  type: CategoryType;

  @Field(() => Int)
  @IsInt()
  order: number;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
