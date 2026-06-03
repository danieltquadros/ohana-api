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

    const [activeCount, inactiveCount] = await Promise.all([
      this.prisma.productIngredient.count({
        where: { ingredientId: id, product: { isActive: true } },
      }),
      this.prisma.productIngredient.count({
        where: { ingredientId: id, product: { isActive: false } },
      }),
    ]);

    if (activeCount > 0 || inactiveCount > 0) {
      const parts: string[] = [];
      if (activeCount > 0) parts.push(`${activeCount} ativo(s)`);
      if (inactiveCount > 0) parts.push(`${inactiveCount} inativo(s)`);
      throw new ConflictException(
        `Não é possível excluir este ingrediente pois está sendo usado em ${parts.join(' e ')} produto(s). Exclua os produtos primeiro.`,
      );
    }

    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}
