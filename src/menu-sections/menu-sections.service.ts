import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuSectionDto } from './dto/create-menu-section.dto';
import { UpdateMenuSectionDto } from './dto/update-menu-section.dto';
import { MenuSection, MenuSectionKind } from '@prisma/client';

@Injectable()
export class MenuSectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMenuSectionDto): Promise<MenuSection> {
    this.validateKindAndProductType(dto.kind, dto.productTypeId);

    if (dto.productTypeId) {
      await this.assertProductTypeExists(dto.productTypeId);
      await this.assertProductTypeNotInUse(dto.productTypeId);
    }

    return this.prisma.menuSection.create({
      data: {
        label: dto.label,
        order: dto.order,
        isActive: dto.isActive ?? true,
        kind: dto.kind,
        productTypeId: dto.productTypeId,
      },
      include: { productType: true },
    });
  }

  async findAll(
    includeInactive = false,
    withContent = false,
  ): Promise<MenuSection[]> {
    const sections = await this.prisma.menuSection.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { order: 'asc' },
      include: { productType: true },
    });

    if (!withContent) {
      return sections;
    }

    // Filtra sections que de fato têm conteúdo disponível pra mostrar
    const filtered: MenuSection[] = [];
    for (const section of sections) {
      if (section.kind === MenuSectionKind.COMBOS) {
        const count = await this.prisma.combo.count({
          where: { isActive: true, price: { gt: 0 } },
        });
        if (count > 0) filtered.push(section);
      } else if (section.kind === MenuSectionKind.PRODUCT_TYPE) {
        if (!section.productTypeId) continue;
        const count = await this.prisma.product.count({
          where: {
            isActive: true,
            price: { gt: 0 },
            productTypeId: section.productTypeId,
          },
        });
        if (count > 0) filtered.push(section);
      }
    }
    return filtered;
  }

  async findOne(id: number): Promise<MenuSection> {
    const section = await this.prisma.menuSection.findUnique({
      where: { id },
      include: { productType: true },
    });

    if (!section) {
      throw new NotFoundException(`MenuSection with ID ${id} not found`);
    }

    return section;
  }

  async update(id: number, dto: UpdateMenuSectionDto): Promise<MenuSection> {
    const existing = await this.findOne(id);

    const nextKind = dto.kind ?? existing.kind;
    const nextProductTypeId =
      dto.productTypeId !== undefined
        ? dto.productTypeId
        : existing.productTypeId;

    this.validateKindAndProductType(nextKind, nextProductTypeId ?? undefined);

    if (nextProductTypeId && nextProductTypeId !== existing.productTypeId) {
      await this.assertProductTypeExists(nextProductTypeId);
      await this.assertProductTypeNotInUse(nextProductTypeId);
    }

    return this.prisma.menuSection.update({
      where: { id },
      data: {
        label: dto.label,
        order: dto.order,
        isActive: dto.isActive,
        kind: dto.kind,
        productTypeId: dto.productTypeId,
      },
      include: { productType: true },
    });
  }

  async remove(id: number): Promise<MenuSection> {
    await this.findOne(id);

    return this.prisma.menuSection.delete({
      where: { id },
    });
  }

  // ----------------------------------------------------------------
  // Validações privadas
  // ----------------------------------------------------------------

  private validateKindAndProductType(
    kind: MenuSectionKind,
    productTypeId?: number | null,
  ): void {
    if (kind === MenuSectionKind.PRODUCT_TYPE && !productTypeId) {
      throw new BadRequestException(
        'productTypeId é obrigatório quando kind = PRODUCT_TYPE.',
      );
    }
    if (kind === MenuSectionKind.COMBOS && productTypeId) {
      throw new BadRequestException(
        'productTypeId não pode ser informado quando kind = COMBOS.',
      );
    }
  }

  private async assertProductTypeExists(productTypeId: number): Promise<void> {
    const found = await this.prisma.productType.findUnique({
      where: { id: productTypeId },
    });
    if (!found) {
      throw new NotFoundException(
        `ProductType with ID ${productTypeId} not found`,
      );
    }
  }

  private async assertProductTypeNotInUse(
    productTypeId: number,
  ): Promise<void> {
    const existing = await this.prisma.menuSection.findUnique({
      where: { productTypeId },
    });
    if (existing) {
      throw new ConflictException(
        `Já existe uma MenuSection para o ProductType ${productTypeId}.`,
      );
    }
  }
}
