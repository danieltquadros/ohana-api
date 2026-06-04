import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { Combo } from '@prisma/client';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComboDto: CreateComboDto): Promise<Combo> {
    const { products, ...comboData } = createComboDto;

    return this.prisma.combo.create({
      data: {
        ...comboData,
        ...(products && products.length > 0
          ? {
              products: {
                create: products.map((p) => ({
                  productId: p.productId,
                  quantity: p.quantity,
                  order: p.order,
                  isCustomizable: p.isCustomizable ?? false,
                })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        products: {
          include: { product: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(includeInactive = false, available = false): Promise<Combo[]> {
    const where = available
      ? { isActive: true, price: { gt: 0 } }
      : includeInactive
        ? undefined
        : { isActive: true };

    return this.prisma.combo.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        category: true,
        products: {
          include: { product: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findOne(id: number): Promise<Combo> {
    const combo = await this.prisma.combo.findUnique({
      where: { id },
      include: {
        category: true,
        products: {
          include: {
            product: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!combo) {
      throw new NotFoundException(`Combo with ID ${id} not found`);
    }

    return combo;
  }

  async update(id: number, updateComboDto: UpdateComboDto): Promise<Combo> {
    await this.findOne(id);

    const { products, ...comboData } = updateComboDto;

    return this.prisma.$transaction(async (tx) => {
      if (products !== undefined) {
        await tx.comboProduct.deleteMany({ where: { comboId: id } });

        if (products.length > 0) {
          await tx.comboProduct.createMany({
            data: products.map((p) => ({
              comboId: id,
              productId: p.productId,
              quantity: p.quantity,
              order: p.order,
              isCustomizable: p.isCustomizable ?? false,
            })),
          });
        }
      }

      return tx.combo.update({
        where: { id },
        data: comboData,
        include: {
          category: true,
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: number): Promise<Combo> {
    await this.findOne(id);

    return this.prisma.combo.delete({
      where: { id },
    });
  }

  async findActive(): Promise<Combo[]> {
    const now = new Date();

    return this.prisma.combo.findMany({
      where: {
        isActive: true,
        OR: [
          {
            validFrom: null,
            validUntil: null,
          },
          {
            validFrom: { lte: now },
            validUntil: { gte: now },
          },
          {
            validFrom: { lte: now },
            validUntil: null,
          },
          {
            validFrom: null,
            validUntil: { gte: now },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }
}
