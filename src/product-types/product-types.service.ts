import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productType.findMany();
  }

  async findOne(id: number) {
    return this.prisma.productType.findUnique({
      where: { id },
    });
  }

  async create(createProductTypeDto: CreateProductTypeDto) {
    return this.prisma.productType.create({
      data: createProductTypeDto,
    });
  }

  async update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
    return this.prisma.productType.update({
      where: { id },
      data: updateProductTypeDto,
    });
  }

  async remove(id: number) {
    const productType = await this.findOne(id);

    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }

    const usageCount = await this.prisma.product.count({
      where: { productTypeId: id, isActive: true },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Não é possível excluir este tipo de produto pois está sendo usado em ${usageCount} produto(s) ativo(s).`,
      );
    }

    return this.prisma.productType.delete({
      where: { id },
    });
  }
}
