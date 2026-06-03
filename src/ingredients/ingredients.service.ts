import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from '@prisma/client';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    return this.prisma.ingredient.create({
      data: createIngredientDto,
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
    updateIngredientDto: UpdateIngredientDto,
  ): Promise<Ingredient> {
    await this.findOne(id);

    return this.prisma.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  async remove(id: number): Promise<Ingredient> {
    await this.findOne(id);

    const activeUsageCount = await this.prisma.productIngredient.count({
      where: {
        ingredientId: id,
        product: { isActive: true },
      },
    });

    if (activeUsageCount > 0) {
      throw new ConflictException(
        `Não é possível excluir este ingrediente pois está sendo usado em ${activeUsageCount} produto(s) ativo(s).`,
      );
    }

    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
