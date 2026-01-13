import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  // Injeção de Dependências (DI)
  constructor(private prisma: PrismaService) {}
  // O NestJS injeta automaticamente o PrismaService aqui!

  // Buscar todos os produtos
  async findAll() {
    return this.prisma.product.findMany({
      include: {
        type: true,
        ingredients: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // Buscar um produto por ID
  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        type: true,
        ingredients: true,
      },
    });
  }

  // Criar um novo produto
  async create(createProductDto: CreateProductDto) {
    const { ingredients, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        ingredients: ingredients
          ? {
              create: ingredients,
            }
          : undefined,
      },
      include: {
        type: true,
        ingredients: true,
      },
    });
  }

  // Atualizar um produto
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Separar ingredients do resto dos dados
    // Update de ingredients é complexo (precisa delete + create), deixamos para depois
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ingredients, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: productData,
      include: {
        type: true,
        ingredients: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
