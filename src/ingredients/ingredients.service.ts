import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientInput } from './dto/create-ingredient.input';
import { UpdateIngredientInput } from './dto/update-ingredient.input';
import { Ingredient } from '@prisma/client';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createIngredientInput: CreateIngredientInput,
  ): Promise<Ingredient> {
    return this.prisma.ingredient.create({
      data: createIngredientInput,
    });
  }

  async findAll(): Promise<Ingredient[]> {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number): Promise<Ingredient> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
            ingredient: true,
          },
        },
      },
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }
    return ingredient;
  }

  async update(
    id: number,
    updateIngredientInput: UpdateIngredientInput | UpdateIngredientDto,
  ): Promise<Ingredient> {
    await this.findOne(id);

    return this.prisma.ingredient.update({
      where: { id },
      data: updateIngredientInput,
    });
  }

  async remove(id: number): Promise<Ingredient> {
    await this.findOne(id);

    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
