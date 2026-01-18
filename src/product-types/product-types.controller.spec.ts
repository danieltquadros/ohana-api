import { Test, TestingModule } from '@nestjs/testing';
import { ProductTypesController } from './product-types.controller';
import { ProductTypesService } from './product-types.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductTypesController', () => {
  let controller: ProductTypesController;

  const mockPrismaService = {
    productType: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTypesController],
      providers: [
        ProductTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<ProductTypesController>(ProductTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
