import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Combo, MenuSection, Product, ProductType } from '@prisma/client';

type ComboWithItems = Combo & {
  products: Array<{
    id: number;
    quantity: number;
    order: number;
    isCustomizable: boolean;
    product: Product;
  }>;
};

type ProductWithItems = Product & {
  ingredients: Array<{
    quantity: number;
    order: number;
    ingredient: { id: number; name: string };
  }>;
};

export type MenuSectionPayload = MenuSection & {
  productType: ProductType | null;
  items: ProductWithItems[] | ComboWithItems[];
};

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenu(): Promise<MenuSectionPayload[]> {
    const sections = await this.prisma.menuSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { productType: true },
    });

    const enriched = await Promise.all(
      sections.map(async (section): Promise<MenuSectionPayload> => {
        if (section.kind === 'COMBOS') {
          const items = await this.prisma.combo.findMany({
            where: { isActive: true, price: { gt: 0 } },
            orderBy: { order: 'asc' },
            include: {
              products: {
                include: { product: true },
                orderBy: { order: 'asc' },
              },
            },
          });
          return { ...section, items };
        }

        if (section.kind === 'PRODUCT_TYPE' && section.productTypeId) {
          const items = await this.prisma.product.findMany({
            where: {
              isActive: true,
              price: { gt: 0 },
              productTypeId: section.productTypeId,
            },
            orderBy: { order: 'asc' },
            include: {
              ingredients: {
                include: { ingredient: true },
                orderBy: { order: 'asc' },
              },
            },
          });
          return { ...section, items };
        }

        return { ...section, items: [] };
      }),
    );

    return enriched.filter((section) => section.items.length > 0);
  }
}
