import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        product: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Aplicar mesma configuração do main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return an array of products', async () => {
      const mockProducts = [
        {
          id: 1,
          title: 'Combo Monstro',
          image: 'combo-monstro.jpg',
          price: 45.0,
          order: 1,
          productTypeId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: { id: 1, name: 'Combos', order: 1 },
          ingredients: [{ id: 1, name: 'Salmão', quantity: 10, productId: 1 }],
        },
      ];

      jest
        .spyOn(prisma.product, 'findMany')
        .mockResolvedValue(mockProducts as any);

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(response.body).toEqual([
        {
          ...mockProducts[0],
          createdAt: mockProducts[0].createdAt.toISOString(),
          updatedAt: mockProducts[0].updatedAt.toISOString(),
        },
      ]);
      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 100,
        title: 'Combo Monstro',
        image: 'combo-monstro.jpg',
        price: 45.0,
        order: 1,
        productTypeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: { id: 1, name: 'Combos', order: 1 },
        ingredients: [],
      };

      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue(mockProduct as any);

      const response = await request(app.getHttpServer())
        .get('/products/100')
        .expect(200);

      expect(response.body).toEqual({
        ...mockProduct,
        createdAt: mockProduct.createdAt.toISOString(),
        updatedAt: mockProduct.updatedAt.toISOString(),
      });
    });

    it('should return null when product not found', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/products/999')
        .expect(200);

      // NestJS retorna {} quando não encontra
      expect(response.body).toEqual({});
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const createDto = {
        title: 'Novo Combo',
        image: 'novo-combo.jpg',
        price: 30.0,
        order: 10,
        productTypeId: 1,
        ingredients: [{ name: 'Salmão', quantity: 5 }],
      };

      const mockCreatedProduct = {
        id: 200,
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: { id: 1, name: 'Combos', order: 1 },
        ingredients: [{ id: 50, name: 'Salmão', quantity: 5, productId: 200 }],
      };

      jest
        .spyOn(prisma.product, 'create')
        .mockResolvedValue(mockCreatedProduct as any);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual({
        ...mockCreatedProduct,
        createdAt: mockCreatedProduct.createdAt.toISOString(),
        updatedAt: mockCreatedProduct.updatedAt.toISOString(),
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        title: 'Test',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/products')
        .send(invalidDto)
        .expect(400);
    });
  });
});
