import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { ingredients, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        ...(ingredients && ingredients.length > 0
          ? {
              ingredients: {
                create: ingredients.map((ing) => ({
                  ingredientId: ing.ingredientId,
                  quantity: ing.quantity,
                  order: ing.order,
                })),
              },
            }
          : {}),
      },
      include: {
        type: true,
        category: true,
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(includeInactive = false, available = false): Promise<Product[]> {
    const where = available
      ? { isActive: true, price: { gt: 0 } }
      : includeInactive
        ? undefined
        : { isActive: true };

    return this.prisma.product.findMany({
      where,
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

  // Extrai o publicId da URL do Cloudinary
  // Ex: "https://res.cloudinary.com/.../ohana/products/abc123.jpg" → "ohana/products/abc123"
  private extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.*)\.\w+$/);
    return match ? match[1] : null;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const existingProduct = await this.findOne(id);

    // Se a imagem mudou, deletar a antiga do Cloudinary
    if (
      updateProductDto.image &&
      updateProductDto.image !== existingProduct.image &&
      existingProduct.image.includes('cloudinary')
    ) {
      const publicId = this.extractPublicId(existingProduct.image);
      if (publicId) {
        await this.uploadService.deleteImage(publicId);
      }
    }

    const { ingredients, ...productData } = updateProductDto;

    return this.prisma.$transaction(async (tx) => {
      // Se ingredients foi enviado, substituir todos
      if (ingredients !== undefined) {
        await tx.productIngredient.deleteMany({ where: { productId: id } });

        if (ingredients.length > 0) {
          await tx.productIngredient.createMany({
            data: ingredients.map((ing) => ({
              productId: id,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity,
              order: ing.order,
            })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: productData,
        include: {
          type: true,
          category: true,
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: number): Promise<Product> {
    const product = await this.findOne(id);

    const [activeCount, inactiveCount] = await Promise.all([
      this.prisma.comboProduct.count({
        where: { productId: id, combo: { isActive: true } },
      }),
      this.prisma.comboProduct.count({
        where: { productId: id, combo: { isActive: false } },
      }),
    ]);

    if (activeCount > 0 || inactiveCount > 0) {
      const parts: string[] = [];
      if (activeCount > 0) parts.push(`${activeCount} ativo(s)`);
      if (inactiveCount > 0) parts.push(`${inactiveCount} inativo(s)`);
      throw new ConflictException(
        `Não é possível excluir este produto pois está sendo usado em ${parts.join(' e ')} combo(s). Exclua os combos primeiro.`,
      );
    }

    // Deletar imagem do Cloudinary se existir
    if (product.image.includes('cloudinary')) {
      const publicId = this.extractPublicId(product.image);
      if (publicId) {
        await this.uploadService.deleteImage(publicId);
      }
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByType(
    productTypeId: number,
    available = false,
  ): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        productTypeId,
        isActive: true,
        ...(available ? { price: { gt: 0 } } : {}),
      },
      include: {
        type: true,
        category: true,
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByCategory(
    categoryId: number,
    available = false,
  ): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
        ...(available ? { price: { gt: 0 } } : {}),
      },
      include: {
        type: true,
        category: true,
        ingredients: {
          include: { ingredient: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }
}
