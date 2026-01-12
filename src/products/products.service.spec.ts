import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
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

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products with type and ingredients', async () => {
      // Arrange - Preparar dados mockados
      const mockProducts = [
        {
          id: 1,
          title: 'Combo Monstro',
          image: 'combo-monstro.jpg',
          price: 45.0,
          order: 1,
          productTypeId: 1,
          type: { id: 1, name: 'Combos', order: 1 },
          ingredients: [{ id: 1, name: 'Salmão', quantity: 10, productId: 1 }],
        },
      ];

      // Configurar o mock para retornar nossos dados
      jest
        .spyOn(prisma.product, 'findMany')
        .mockResolvedValue(mockProducts as any);

      // Act - Executar o método
      const result = await service.findAll();

      // Assert - Verificar resultados
      expect(result).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        include: {
          type: true,
          ingredients: true,
        },
        orderBy: {
          order: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id with relations', async () => {
      // Arrange
      const mockProduct = {
        id: 100,
        title: 'Combo Monstro',
        image: 'combo-monstro.jpg',
        price: 45.0,
        order: 1,
        productTypeId: 1,
        type: { id: 1, name: 'Combos', order: 1 },
        ingredients: [{ id: 1, name: 'Salmão', quantity: 10, productId: 100 }],
      };

      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(mockProduct as any);

      // Act
      const result = await service.findOne(100);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 100 },
        include: { type: true, ingredients: true },
      });
    });

    it('should return null when product not found', async () => {
      // Arrange
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.findOne(999);

      // Assert
      expect(result).toBeNull();
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { type: true, ingredients: true },
      });
    });
  });

  describe('create', () => {
    it('should create a product with ingredients', async () => {
      // Arrange
      const createProductDto = {
        title: 'Novo Combo',
        image: 'novo-combo.jpg',
        price: 30.0,
        order: 10,
        productTypeId: 1,
        ingredients: [
          { name: 'Salmão', quantity: 5 },
          { name: 'Cream Cheese', quantity: 2 },
        ],
      };

      const mockCreatedProduct = {
        id: 200,
        title: 'Novo Combo',
        image: 'novo-combo.jpg',
        price: 30.0,
        order: 10,
        productTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: { id: 1, name: 'Combos', order: 1 },
        ingredients: [
          { id: 50, name: 'Salmão', quantity: 5, productId: 200 },
          { id: 51, name: 'Cream Cheese', quantity: 2, productId: 200 },
        ],
      };

      jest
        .spyOn(prisma.product, 'create')
        .mockResolvedValue(mockCreatedProduct as any);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(result).toEqual(mockCreatedProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          title: 'Novo Combo',
          image: 'novo-combo.jpg',
          price: 30.0,
          order: 10,
          productTypeId: 1,
          ingredients: {
            create: [
              { name: 'Salmão', quantity: 5 },
              { name: 'Cream Cheese', quantity: 2 },
            ],
          },
        },
        include: {
          type: true,
          ingredients: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const updateProductDto = {
        title: 'Combo Atualizado',
        price: 50.0,
      };

      const mockUpdatedProduct = {
        id: 100,
        title: 'Combo Atualizado',
        image: 'combo-monstro.jpg',
        price: 50.0,
        order: 1,
        productTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: { id: 1, name: 'Combos', order: 1 },
        ingredients: [],
      };

      jest
        .spyOn(prisma.product, 'update')
        .mockResolvedValue(mockUpdatedProduct as any);

      // Act
      const result = await service.update(100, updateProductDto);

      // Assert
      expect(result).toEqual(mockUpdatedProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 100 },
        data: updateProductDto,
        include: {
          type: true,
          ingredients: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      // Arrange
      const mockDeletedProduct = {
        id: 100,
        title: 'Combo Monstro',
        image: 'combo-monstro.jpg',
        price: 45.0,
        order: 1,
        productTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.product, 'delete')
        .mockResolvedValue(mockDeletedProduct as any);

      // Act
      const result = await service.remove(100);

      // Assert
      expect(result).toEqual(mockDeletedProduct);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 100 },
      });
    });
  });
});
