import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('ProductTypesController', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        productType: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /product-types', () => {
    it('should return an array of product types', async () => {
      const mockProductTypes = [
        { id: 1, name: 'Combos', order: 1 },
        { id: 2, name: 'Bebidas', order: 2 },
      ];

      jest
        .spyOn(prisma.productType, 'findMany')
        .mockResolvedValue(mockProductTypes as any);

      const response = await request(app.getHttpServer())
        .get('/product-types')
        .expect(200);

      expect(response.body).toEqual(mockProductTypes);
      expect(prisma.productType.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /product-types/:id', () => {
    it('should return a single product type by id', async () => {
      const mockProductType = { id: 1, name: 'Combos', order: 1 };

      jest
        .spyOn(prisma.productType, 'findUnique')
        .mockResolvedValue(mockProductType as any);

      const response = await request(app.getHttpServer())
        .get('/product-types/1')
        .expect(200);

      expect(response.body).toEqual(mockProductType);
      expect(prisma.productType.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.productType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if product type not found', async () => {
      jest.spyOn(prisma.productType, 'findUnique').mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/product-types/999')
        .expect(200);

      expect(response.body).toEqual({});
      expect(prisma.productType.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.productType.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('POST /product-types', () => {
    it('should create and return a new product type', async () => {
      const createDto = { name: 'Novos Produtos', order: 3 };
      const mockCreatedType = { id: 3, name: 'Novos Produtos', order: 3 };

      jest
        .spyOn(prisma.productType, 'create')
        .mockResolvedValue(mockCreatedType as any);

      const response = await request(app.getHttpServer())
        .post('/product-types')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockCreatedType);
      expect(prisma.productType.create).toHaveBeenCalledTimes(1);
      expect(prisma.productType.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should return 400 for invalid input', async () => {
      const invalidDto = { invalidField: 'Invalid' };

      await request(app.getHttpServer())
        .post('/product-types')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('PATCH /product-types/:id', () => {
    it('should update and return the product type', async () => {
      const updateDto = { name: 'Produtos Atualizados' };
      const mockUpdatedType = { id: 1, name: 'Produtos Atualizados', order: 1 };

      jest
        .spyOn(prisma.productType, 'update')
        .mockResolvedValue(mockUpdatedType as any);

      const response = await request(app.getHttpServer())
        .patch('/product-types/1')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedType);
      expect(prisma.productType.update).toHaveBeenCalledTimes(1);
      expect(prisma.productType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should return 400 for invalid input', async () => {
      const invalidDto = { invalidField: 'Invalid' };

      await request(app.getHttpServer())
        .patch('/product-types/1')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /product-types/:id', () => {
    it('should delete and return the product type', async () => {
      const mockDeletedType = { id: 1, name: 'Combos', order: 1 };

      jest
        .spyOn(prisma.productType, 'delete')
        .mockResolvedValue(mockDeletedType as any);

      const response = await request(app.getHttpServer())
        .delete('/product-types/1')
        .expect(200);

      expect(response.body).toEqual(mockDeletedType);
      expect(prisma.productType.delete).toHaveBeenCalledTimes(1);
      expect(prisma.productType.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
