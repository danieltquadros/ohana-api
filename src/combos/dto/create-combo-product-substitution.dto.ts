import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateComboProductSubstitutionDto {
  @IsInt()
  comboProductId: number;

  @IsInt()
  substituteProductId: number;

  @IsNumber()
  @IsOptional()
  extraCost?: number;
}
