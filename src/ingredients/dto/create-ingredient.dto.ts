import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isAllergenic?: boolean;
}
