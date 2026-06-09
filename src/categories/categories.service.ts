import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import { toSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const name = toSlug(createCategoryDto.label);

    const existing = await this.prisma.category.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException(
        `Já existe uma categoria com nome técnico "${name}" (gerado a partir do label "${createCategoryDto.label}").`,
      );
    }

    return this.prisma.category.create({
      data: { ...createCategoryDto, name },
    });
  }

  async findAll(includeInactive = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: includeInactive ? undefined : { isActive: true },
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

    const [activeProducts, inactiveProducts, activeCombos, inactiveCombos] =
      await Promise.all([
        this.prisma.product.count({
          where: { categoryId: id, isActive: true },
        }),
        this.prisma.product.count({
          where: { categoryId: id, isActive: false },
        }),
        this.prisma.combo.count({
          where: { categoryId: id, isActive: true },
        }),
        this.prisma.combo.count({
          where: { categoryId: id, isActive: false },
        }),
      ]);

    const totalProducts = activeProducts + inactiveProducts;
    const totalCombos = activeCombos + inactiveCombos;

    if (totalProducts > 0 || totalCombos > 0) {
      const parts: string[] = [];
      if (totalProducts > 0) {
        const detail = `${totalProducts} produto(s)`;
        parts.push(
          inactiveProducts > 0
            ? `${detail} (${activeProducts} ativo(s), ${inactiveProducts} inativo(s))`
            : detail,
        );
      }
      if (totalCombos > 0) {
        const detail = `${totalCombos} combo(s)`;
        parts.push(
          inactiveCombos > 0
            ? `${detail} (${activeCombos} ativo(s), ${inactiveCombos} inativo(s))`
            : detail,
        );
      }
      throw new ConflictException(
        `Não é possível excluir esta categoria pois está sendo usada em ${parts.join(' e ')}. Exclua-os primeiro.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
