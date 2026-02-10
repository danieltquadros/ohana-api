import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateComboProductDto {
  @IsInt()
  comboId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  order: number;

  @IsBoolean()
  @IsOptional()
  isCustomizable?: boolean;
}
