import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypesService } from './product-types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductTypesService', () => {
  let service: ProductTypesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductTypesService,
        {
          provide: PrismaService,
          useValue: {
            productType: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductTypesService>(ProductTypesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of product types', async () => {
      // Arrange - Preparar dados mockados
      const mockProductTypes = [
        { id: 1, name: 'Combos', order: 1 },
        { id: 2, name: 'Bebidas', order: 2 },
      ];

      jest
        .spyOn(prisma.productType, 'findMany')
        .mockResolvedValue(mockProductTypes as any);

      // Act - Executar o método
      const result = await service.findAll();

      // Assert - Verificar resultados
      expect(result).toEqual(mockProductTypes);
      expect(prisma.productType.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single product type by id', async () => {
      // Arrange
      const mockProductType = { id: 1, name: 'Combos', order: 1 };

      jest
        .spyOn(prisma.productType, 'findUnique')
        .mockResolvedValue(mockProductType as any);

      // Act
      const result = await service.findOne(1);

      expect(result).toEqual(mockProductType);
      expect(prisma.productType.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.productType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if product type not found', async () => {
      // Arrange
      jest.spyOn(prisma.productType, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(prisma.productType.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.productType.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new product type', async () => {
      // Arrange
      const createDto = { name: 'Novos Produtos', order: 3 };
      const mockCreatedType = { id: 3, name: 'Novos Produtos', order: 3 };

      jest
        .spyOn(prisma.productType, 'create')
        .mockResolvedValue(mockCreatedType as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockCreatedType);
      expect(prisma.productType.create).toHaveBeenCalledTimes(1);
      expect(prisma.productType.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update and return the product type', async () => {
      // Arrange
      const updateDto = { name: 'Produtos Atualizados' };
      const mockUpdatedType = { id: 1, name: 'Produtos Atualizados', order: 1 };

      jest
        .spyOn(prisma.productType, 'update')
        .mockResolvedValue(mockUpdatedType as any);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result).toEqual(mockUpdatedType);
      expect(prisma.productType.update).toHaveBeenCalledTimes(1);
      expect(prisma.productType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete and return the product type', async () => {
      // Arrange
      const mockDeletedType = { id: 1, name: 'Combos', order: 1 };

      jest
        .spyOn(prisma.productType, 'delete')
        .mockResolvedValue(mockDeletedType as any);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual(mockDeletedType);
      expect(prisma.productType.delete).toHaveBeenCalledTimes(1);
      expect(prisma.productType.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
