import { Test, TestingModule } from '@nestjs/testing';
import { CombosService } from './combos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CombosService', () => {
  let service: CombosService;

  const mockPrismaService = {
    combo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comboProduct: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
  };

  const mockCombo = {
    id: 1,
    title: 'Combo Especial',
    description: 'Combo com 3 pratos',
    image: 'combo-especial.jpg',
    price: 89.9,
    discount: 10.0,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2024-12-31'),
    isActive: true,
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: null,
    updatedBy: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CombosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CombosService>(CombosService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new combo', async () => {
      const createDto = {
        title: 'Combo Especial',
        description: 'Combo com 3 pratos',
        image: 'combo-especial.jpg',
        price: 89.9,
        discount: 10.0,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        order: 1,
      };

      mockPrismaService.combo.create.mockResolvedValue(mockCombo);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCombo);
      expect(mockPrismaService.combo.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          category: true,
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
      expect(mockPrismaService.combo.create).toHaveBeenCalledTimes(1);
    });

    it('should create a combo with createdBy', async () => {
      const createDto = {
        title: 'Combo Premium',
        description: 'Premium combo',
        image: 'premium.jpg',
        price: 199.9,
        discount: 20.0,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        order: 2,
        createdBy: 1,
      };

      const comboWithCreatedBy = { ...mockCombo, ...createDto };
      mockPrismaService.combo.create.mockResolvedValue(comboWithCreatedBy);

      const result = await service.create(createDto);

      expect(result.createdBy).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all active combos', async () => {
      const combos = [
        mockCombo,
        { ...mockCombo, id: 2, title: 'Combo Premium' },
      ];
      mockPrismaService.combo.findMany.mockResolvedValue(combos);

      const result = await service.findAll();

      expect(result).toEqual(combos);
      expect(mockPrismaService.combo.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          category: true,
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('should return empty array when no combos exist', async () => {
      mockPrismaService.combo.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('should return combos valid for today', async () => {
      const today = new Date();
      const validCombo = {
        ...mockCombo,
        validFrom: new Date(today.getTime() - 86400000), // yesterday
        validUntil: new Date(today.getTime() + 86400000), // tomorrow
      };

      mockPrismaService.combo.findMany.mockResolvedValue([validCombo]);

      const result = await service.findActive();

      expect(result).toEqual([validCombo]);
      expect(mockPrismaService.combo.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            {
              validFrom: null,
              validUntil: null,
            },
            {
              validFrom: { lte: expect.any(Date) },
              validUntil: { gte: expect.any(Date) },
            },
            {
              validFrom: { lte: expect.any(Date) },
              validUntil: null,
            },
            {
              validFrom: null,
              validUntil: { gte: expect.any(Date) },
            },
          ],
        },
        include: {
          category: true,
        },
        orderBy: { order: 'asc' },
      });
    });

    it('should not return expired combos', async () => {
      mockPrismaService.combo.findMany.mockResolvedValue([]);

      const result = await service.findActive();

      expect(result).toEqual([]);
    });

    it('should not return future combos', async () => {
      mockPrismaService.combo.findMany.mockResolvedValue([]);

      const result = await service.findActive();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a combo by id', async () => {
      mockPrismaService.combo.findUnique.mockResolvedValue(mockCombo);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCombo);
      expect(mockPrismaService.combo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should throw NotFoundException when combo does not exist', async () => {
      mockPrismaService.combo.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Combo with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a combo', async () => {
      const updateDto = {
        title: 'Combo Especial Atualizado',
        price: 99.9,
        updatedBy: 1,
      };

      const updatedCombo = { ...mockCombo, ...updateDto };
      mockPrismaService.combo.findUnique.mockResolvedValue(mockCombo);
      mockPrismaService.combo.update.mockResolvedValue(updatedCombo);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedCombo);
      expect(mockPrismaService.combo.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(mockPrismaService.combo.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: {
          category: true,
          products: {
            include: { product: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('should update validity dates', async () => {
      const updateDto = {
        validFrom: new Date('2024-06-01'),
        validUntil: new Date('2024-06-30'),
      };

      const updatedCombo = { ...mockCombo, ...updateDto };
      mockPrismaService.combo.findUnique.mockResolvedValue(mockCombo);
      mockPrismaService.combo.update.mockResolvedValue(updatedCombo);

      const result = await service.update(1, updateDto);

      expect(result.validFrom).toEqual(updateDto.validFrom);
      expect(result.validUntil).toEqual(updateDto.validUntil);
    });

    it('should throw NotFoundException when updating non-existent combo', async () => {
      const updateDto = { title: 'Updated' };
      mockPrismaService.combo.findUnique.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.combo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should hard delete a combo', async () => {
      mockPrismaService.combo.findUnique.mockResolvedValue(mockCombo);
      mockPrismaService.combo.delete.mockResolvedValue(mockCombo);

      const result = await service.remove(1);

      expect(result).toEqual(mockCombo);
      expect(mockPrismaService.combo.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when removing non-existent combo', async () => {
      mockPrismaService.combo.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.combo.delete).not.toHaveBeenCalled();
    });
  });
});
