import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    combo: {
      count: jest.fn(),
    },
  };

  const mockCategory = {
    id: 1,
    name: 'Premium',
    type: CategoryType.PRODUCT,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto = {
        name: 'Premium',
        type: CategoryType.PRODUCT,
        order: 1,
      };

      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(mockPrismaService.category.create).toHaveBeenCalledTimes(1);
    });

    it('should create a category with optional fields', async () => {
      const createDto = {
        name: 'Especial',
        type: CategoryType.COMBO,
        order: 2,
        createdBy: 1,
      };

      const categoryWithCreatedBy = { ...mockCategory, ...createDto };
      mockPrismaService.category.create.mockResolvedValue(
        categoryWithCreatedBy,
      );

      const result = await service.create(createDto);

      expect(result).toEqual(categoryWithCreatedBy);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all active categories', async () => {
      const categories = [
        mockCategory,
        { ...mockCategory, id: 2, name: 'Especial' },
      ];
      mockPrismaService.category.findMany.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
      expect(mockPrismaService.category.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories exist', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Category with ID 999 not found',
      );
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = {
        name: 'Premium Updated',
        updatedBy: 1,
      };

      const updatedCategory = { ...mockCategory, ...updateDto };
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when updating non-existent category', async () => {
      const updateDto = { name: 'Updated' };
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should hard delete a category when not in use', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.combo.count.mockResolvedValue(0);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(1);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw ConflictException when category has products (active or inactive)', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.count.mockImplementation(
        (args: { where: { isActive: boolean } }) =>
          Promise.resolve(args.where.isActive ? 3 : 0),
      );
      mockPrismaService.combo.count.mockResolvedValue(0);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when category has combos (active or inactive)', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.count.mockResolvedValue(0);
      mockPrismaService.combo.count.mockImplementation(
        (args: { where: { isActive: boolean } }) =>
          Promise.resolve(args.where.isActive ? 0 : 2),
      );

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when removing non-existent category', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.category.delete).not.toHaveBeenCalled();
    });
  });
});
