import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Offer } from '@prisma/client';
import { OfferKind, OfferScope } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  private validateCoherence(dto: CreateOfferDto | UpdateOfferDto) {
    const {
      kind,
      scope,
      percentage,
      fixedAmount,
      productIds,
      comboIds,
      categoryIds,
      productTypeIds,
    } = dto;

    // Se kind não foi informado (update parcial), pula validações de valor.
    if (kind !== undefined) {
      if (kind === OfferKind.PERCENTAGE) {
        if (percentage == null) {
          throw new BadRequestException(
            'percentage é obrigatório quando kind=PERCENTAGE',
          );
        }
        if (fixedAmount != null) {
          throw new BadRequestException('PERCENTAGE não usa fixedAmount');
        }
      }
      if (kind === OfferKind.FIXED_AMOUNT || kind === OfferKind.FIXED_PRICE) {
        if (fixedAmount == null) {
          throw new BadRequestException(
            `fixedAmount é obrigatório quando kind=${kind}`,
          );
        }
        if (percentage != null) {
          throw new BadRequestException(`${kind} não usa percentage`);
        }
      }
      if (
        kind === OfferKind.FREE_SHIPPING &&
        (percentage != null || fixedAmount != null)
      ) {
        throw new BadRequestException(
          'FREE_SHIPPING não usa percentage nem fixedAmount',
        );
      }
    }

    // Validações de range (independentes do kind)
    if (percentage != null && (percentage < 0 || percentage > 100)) {
      throw new BadRequestException('percentage precisa estar entre 0 e 100');
    }
    if (fixedAmount != null && fixedAmount < 0) {
      throw new BadRequestException('fixedAmount precisa ser >= 0');
    }

    // scope × targets — só valida quando scope veio
    if (scope !== undefined) {
      if (scope === OfferScope.PRODUCT && !productIds?.length) {
        throw new BadRequestException(
          'scope=PRODUCT exige pelo menos 1 productId',
        );
      }
      if (scope === OfferScope.COMBO && !comboIds?.length) {
        throw new BadRequestException('scope=COMBO exige pelo menos 1 comboId');
      }
      if (scope === OfferScope.CATEGORY && !categoryIds?.length) {
        throw new BadRequestException(
          'scope=CATEGORY exige pelo menos 1 categoryId',
        );
      }
      if (scope === OfferScope.PRODUCT_TYPE && !productTypeIds?.length) {
        throw new BadRequestException(
          'scope=PRODUCT_TYPE exige pelo menos 1 productTypeId',
        );
      }
      if (
        scope === OfferScope.CART_TOTAL &&
        (productIds?.length ||
          comboIds?.length ||
          categoryIds?.length ||
          productTypeIds?.length)
      ) {
        throw new BadRequestException(
          'scope=CART_TOTAL não deve ter targets específicos',
        );
      }
    }
  }

  private fullInclude() {
    return {
      products: { include: { product: true } },
      combos: { include: { combo: true } },
      categories: { include: { category: true } },
      productTypes: { include: { productType: true } },
    };
  }

  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    this.validateCoherence(createOfferDto);

    const { productIds, comboIds, categoryIds, productTypeIds, ...offerData } =
      createOfferDto;

    return this.prisma.offer.create({
      data: {
        ...offerData,
        products: productIds?.length
          ? { create: productIds.map((productId) => ({ productId })) }
          : undefined,
        combos: comboIds?.length
          ? { create: comboIds.map((comboId) => ({ comboId })) }
          : undefined,
        categories: categoryIds?.length
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        productTypes: productTypeIds?.length
          ? {
              create: productTypeIds.map((productTypeId) => ({
                productTypeId,
              })),
            }
          : undefined,
      },
      include: this.fullInclude(),
    });
  }

  async findAll(includeInactive = false): Promise<Offer[]> {
    return this.prisma.offer.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: this.fullInclude(),
    });
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: this.fullInclude(),
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    await this.findOne(id); // lança NotFoundException se não existir

    this.validateCoherence(updateOfferDto);

    const { productIds, comboIds, categoryIds, productTypeIds, ...offerData } =
      updateOfferDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. deletar pivots existentes só dos que vieram no payload (não mexe nos que ficaram fora)
      if (productIds !== undefined) {
        await tx.offerProduct.deleteMany({ where: { offerId: id } });
      }
      if (comboIds !== undefined) {
        await tx.offerCombo.deleteMany({ where: { offerId: id } });
      }
      if (categoryIds !== undefined) {
        await tx.offerCategory.deleteMany({ where: { offerId: id } });
      }
      if (productTypeIds !== undefined) {
        await tx.offerProductType.deleteMany({ where: { offerId: id } });
      }

      // 2. atualizar Offer + recriar pivots novos
      return tx.offer.update({
        where: { id },
        data: {
          ...offerData,
          products:
            productIds !== undefined
              ? { create: productIds.map((productId) => ({ productId })) }
              : undefined,
          combos:
            comboIds !== undefined
              ? { create: comboIds.map((comboId) => ({ comboId })) }
              : undefined,
          categories:
            categoryIds !== undefined
              ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
              : undefined,
          productTypes:
            productTypeIds !== undefined
              ? {
                  create: productTypeIds.map((productTypeId) => ({
                    productTypeId,
                  })),
                }
              : undefined,
        },
        include: this.fullInclude(),
      });
    });
  }

  async setActive(id: number, isActive: boolean): Promise<Offer> {
    await this.findOne(id); // lança NotFoundException se não existir
    return this.prisma.offer.update({
      where: { id },
      data: { isActive },
      include: this.fullInclude(),
    });
  }

  async remove(id: number): Promise<Offer> {
    const offer = await this.findOne(id); // lança NotFoundException se não existir
    await this.prisma.offer.delete({
      where: { id },
    });
    return offer;
  }
}
