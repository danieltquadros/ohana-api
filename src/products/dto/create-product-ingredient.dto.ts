import { IsInt } from 'class-validator';

export class CreateProductIngredientDto {
  @IsInt()
  productId: number;

  @IsInt()
  ingredientId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  order: number;
}
