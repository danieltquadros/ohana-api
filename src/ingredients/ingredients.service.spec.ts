import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsService } from './ingredients.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('IngredientsService', () => {
  let service: IngredientsService;

  const mockPrismaService = {
    ingredient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productIngredient: {
      count: jest.fn(),
    },
  };

  const mockIngredient = {
    id: 1,
    name: 'Salmão',
    isAllergenic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ingredient', async () => {
      const createDto = {
        name: 'Salmão',
        isAllergenic: false,
      };

      mockPrismaService.ingredient.create.mockResolvedValue(mockIngredient);

      const result = await service.create(createDto);

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(mockPrismaService.ingredient.create).toHaveBeenCalledTimes(1);
    });

    it('should create an allergenic ingredient', async () => {
      const createDto = {
        name: 'Amendoim',
        isAllergenic: true,
        createdBy: 1,
      };

      const allergenicIngredient = { ...mockIngredient, ...createDto };
      mockPrismaService.ingredient.create.mockResolvedValue(
        allergenicIngredient,
      );

      const result = await service.create(createDto);

      expect(result.isAllergenic).toBe(true);
      expect(mockPrismaService.ingredient.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all ingredients', async () => {
      const ingredients = [
        mockIngredient,
        { ...mockIngredient, id: 2, name: 'Atum' },
      ];
      mockPrismaService.ingredient.findMany.mockResolvedValue(ingredients);

      const result = await service.findAll();

      expect(result).toEqual(ingredients);
      expect(mockPrismaService.ingredient.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no ingredients exist', async () => {
      mockPrismaService.ingredient.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an ingredient by id', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);

      const result = await service.findOne(1);

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              product: true,
              ingredient: true,
            },
          },
        },
      });
      expect(mockPrismaService.ingredient.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return ingredient with products relation', async () => {
      const ingredientWithProducts = {
        ...mockIngredient,
        products: [
          {
            id: 1,
            productId: 1,
            ingredientId: 1,
            quantity: 10,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockPrismaService.ingredient.findUnique.mockResolvedValue(
        ingredientWithProducts,
      );

      const result = await service.findOne(1);

      expect(result.products).toBeDefined();
      expect(result.products).toHaveLength(1);
    });

    it('should throw NotFoundException when ingredient does not exist', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Ingredient with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update an ingredient', async () => {
      const updateDto = {
        name: 'Salmão Fresco',
        updatedBy: 1,
      };

      const updatedIngredient = { ...mockIngredient, ...updateDto };
      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockPrismaService.ingredient.update.mockResolvedValue(updatedIngredient);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedIngredient);
      expect(mockPrismaService.ingredient.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          products: {
            include: {
              product: true,
              ingredient: true,
            },
          },
        },
      });
      expect(mockPrismaService.ingredient.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should update isAllergenic field', async () => {
      const updateDto = { isAllergenic: true };
      const updatedIngredient = { ...mockIngredient, isAllergenic: true };

      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockPrismaService.ingredient.update.mockResolvedValue(updatedIngredient);

      const result = await service.update(1, updateDto);

      expect(result.isAllergenic).toBe(true);
    });

    it('should throw NotFoundException when updating non-existent ingredient', async () => {
      const updateDto = { name: 'Updated' };
      mockPrismaService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.ingredient.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an ingredient when not used by any product', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockPrismaService.productIngredient.count.mockResolvedValue(0);
      mockPrismaService.ingredient.delete.mockResolvedValue(mockIngredient);

      const result = await service.remove(1);

      expect(result).toEqual(mockIngredient);
      expect(mockPrismaService.ingredient.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw ConflictException when ingredient is in use by active products', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockPrismaService.productIngredient.count.mockImplementation(
        (args: { where: { product: { isActive: boolean } } }) =>
          Promise.resolve(args.where.product.isActive ? 3 : 0),
      );

      await expect(service.remove(1)).rejects.toThrow(
        /3 ativo\(s\) produto\(s\)/,
      );
      expect(mockPrismaService.ingredient.delete).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when ingredient is in use by inactive products', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(mockIngredient);
      mockPrismaService.productIngredient.count.mockImplementation(
        (args: { where: { product: { isActive: boolean } } }) =>
          Promise.resolve(args.where.product.isActive ? 0 : 2),
      );

      await expect(service.remove(1)).rejects.toThrow(
        /2 inativo\(s\) produto\(s\)/,
      );
      expect(mockPrismaService.ingredient.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when removing non-existent ingredient', async () => {
      mockPrismaService.ingredient.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.ingredient.delete).not.toHaveBeenCalled();
    });
  });
});
