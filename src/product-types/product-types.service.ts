import { Injectable } from '@nestjs/common';
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
    return this.prisma.productType.delete({
      where: { id },
    });
  }
}
