import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number): Promise<Category> {
    await this.findOne(id);

    const [activeProducts, activeCombos] = await Promise.all([
      this.prisma.product.count({
        where: { categoryId: id, isActive: true },
      }),
      this.prisma.combo.count({
        where: { categoryId: id, isActive: true },
      }),
    ]);

    if (activeProducts > 0 || activeCombos > 0) {
      const parts: string[] = [];
      if (activeProducts > 0) {
        parts.push(`${activeProducts} produto(s)`);
      }
      if (activeCombos > 0) {
        parts.push(`${activeCombos} combo(s)`);
      }
      throw new ConflictException(
        `Não é possível excluir esta categoria pois está sendo usada em ${parts.join(' e ')} ativo(s).`,
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
