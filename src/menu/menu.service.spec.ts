import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MenuService', () => {
  let service: MenuService;

  const mockPrismaService = {
    menuSection: {
      findMany: jest.fn(),
    },
    combo: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMenu', () => {
    it('returns active sections enriched with their items, ordered by section.order', async () => {
      const sectionCombos = {
        id: 1,
        label: 'Combos',
        order: 1,
        kind: 'COMBOS',
        isActive: true,
        productTypeId: null,
        productType: null,
      };
      const sectionTemaki = {
        id: 2,
        label: 'Temakis',
        order: 2,
        kind: 'PRODUCT_TYPE',
        isActive: true,
        productTypeId: 10,
        productType: { id: 10, name: 'TEMAKI', label: 'Temakis' },
      };
      const combo = { id: 100, name: 'Combo 1', price: 50, isActive: true };
      const product = { id: 200, title: 'Temaki Salmão', price: 20, isActive: true };

      mockPrismaService.menuSection.findMany.mockResolvedValue([
        sectionCombos,
        sectionTemaki,
      ]);
      mockPrismaService.combo.findMany.mockResolvedValue([combo]);
      mockPrismaService.product.findMany.mockResolvedValue([product]);

      const result = await service.getMenu();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 1,
        kind: 'COMBOS',
        items: [combo],
      });
      expect(result[1]).toMatchObject({
        id: 2,
        kind: 'PRODUCT_TYPE',
        items: [product],
      });

      expect(mockPrismaService.menuSection.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { productType: true },
      });
      expect(mockPrismaService.combo.findMany).toHaveBeenCalledWith({
        where: { isActive: true, price: { gt: 0 } },
        orderBy: { order: 'asc' },
        include: {
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          price: { gt: 0 },
          productTypeId: 10,
        },
        orderBy: { order: 'asc' },
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('filters out sections with no items', async () => {
      mockPrismaService.menuSection.findMany.mockResolvedValue([
        {
          id: 1,
          label: 'Combos',
          order: 1,
          kind: 'COMBOS',
          isActive: true,
          productTypeId: null,
          productType: null,
        },
        {
          id: 2,
          label: 'Temakis',
          order: 2,
          kind: 'PRODUCT_TYPE',
          isActive: true,
          productTypeId: 10,
          productType: { id: 10, name: 'TEMAKI', label: 'Temakis' },
        },
      ]);
      mockPrismaService.combo.findMany.mockResolvedValue([]);
      mockPrismaService.product.findMany.mockResolvedValue([
        { id: 200, title: 'Temaki Salmão', price: 20, isActive: true },
      ]);

      const result = await service.getMenu();

      expect(result).toHaveLength(1);
      expect(result[0].kind).toBe('PRODUCT_TYPE');
    });

    it('returns empty array when no active sections exist', async () => {
      mockPrismaService.menuSection.findMany.mockResolvedValue([]);

      const result = await service.getMenu();

      expect(result).toEqual([]);
      expect(mockPrismaService.combo.findMany).not.toHaveBeenCalled();
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('skips PRODUCT_TYPE section without productTypeId (data inconsistency safeguard)', async () => {
      mockPrismaService.menuSection.findMany.mockResolvedValue([
        {
          id: 99,
          label: 'Órfã',
          order: 1,
          kind: 'PRODUCT_TYPE',
          isActive: true,
          productTypeId: null,
          productType: null,
        },
      ]);

      const result = await service.getMenu();

      expect(result).toEqual([]);
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });
  });
});
