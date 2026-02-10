import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComboInput } from './dto/create-combo.input';
import { Combo } from '@prisma/client';
import { UpdateComboInput } from './dto/update-combo.input';
import { UpdateComboDto } from './dto/update-combo.dto';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComboInput: CreateComboInput): Promise<Combo> {
    return this.prisma.combo.create({
      data: createComboInput,
    });
  }

  async findAll(): Promise<Combo[]> {
    return this.prisma.combo.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        category: true,
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

  async update(
    id: number,
    updateComboInput: UpdateComboInput | UpdateComboDto,
  ): Promise<Combo> {
    await this.findOne(id);

    return this.prisma.combo.update({
      where: { id },
      data: updateComboInput,
    });
  }

  async remove(id: number): Promise<Combo> {
    await this.findOne(id);

    return this.prisma.combo.update({
      where: { id },
      data: { isActive: false },
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
