import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductInput: CreateProductInput): Promise<Product> {
    return this.prisma.product.create({
      data: createProductInput,
    });
  }

  async findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        type: true,
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        type: true,
        category: true,
        ingredients: {
          include: {
            ingredient: true,
          },
          orderBy: { order: 'asc' },
        },
        combos: {
          include: {
            combo: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductInput: UpdateProductInput | UpdateProductDto,
  ): Promise<Product> {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductInput,
    });
  }

  async remove(id: number): Promise<Product> {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByType(productTypeId: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        productTypeId,
        isActive: true,
      },
      include: {
        type: true,
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        type: true,
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }
}
