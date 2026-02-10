import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProduct = {
    id: 1,
    title: 'Hot Filadélfia',
    image: 'hot-filadelfia.jpg',
    price: 45.9,
    order: 1,
    isActive: true,
    productTypeId: 1,
    categoryId: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        title: 'Hot Filadélfia',
        image: 'hot-filadelfia.jpg',
        price: 45.9,
        order: 1,
        productTypeId: 1,
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(mockPrismaService.product.create).toHaveBeenCalledTimes(1);
    });

    it('should create a product with categoryId', async () => {
      const createDto = {
        title: 'Hot Premium',
        image: 'hot-premium.jpg',
        price: 65.9,
        order: 2,
        productTypeId: 1,
        categoryId: 1,
        createdBy: 1,
      };

      const productWithCategory = { ...mockProduct, ...createDto };
      mockPrismaService.product.create.mockResolvedValue(productWithCategory);

      const result = await service.create(createDto);

      expect(result.categoryId).toBe(1);
      expect(result.createdBy).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all active products', async () => {
      const products = [
        mockProduct,
        { ...mockProduct, id: 2, title: 'Hot Salmão' },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
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
    });

    it('should return empty array when no products exist', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByType', () => {
    it('should return products filtered by type', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findByType(1);

      expect(result).toEqual(products);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          productTypeId: 1,
        },
        include: {
          type: true,
          category: true,
        },
        orderBy: { order: 'asc' },
      });
    });

    it('should return empty array when no products match type', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findByType(999);

      expect(result).toEqual([]);
    });
  });

  describe('findByCategory', () => {
    it('should return products filtered by category', async () => {
      const products = [mockProduct];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findByCategory(1);

      expect(result).toEqual(products);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          categoryId: 1,
        },
        include: {
          type: true,
          category: true,
        },
        orderBy: { order: 'asc' },
      });
    });

    it('should return empty array when no products match category', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findByCategory(999);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = {
        title: 'Hot Filadélfia Atualizado',
        price: 49.9,
        updatedBy: 1,
      };

      const updatedProduct = { ...mockProduct, ...updateDto };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should update categoryId', async () => {
      const updateDto = { categoryId: 2 };
      const updatedProduct = { ...mockProduct, categoryId: 2 };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result.categoryId).toBe(2);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      const updateDto = { title: 'Updated' };
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const softDeletedProduct = { ...mockProduct, isActive: false };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(softDeletedProduct);

      const result = await service.remove(1);

      expect(result).toEqual(softDeletedProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.product.update).not.toHaveBeenCalled();
    });
  });
});
