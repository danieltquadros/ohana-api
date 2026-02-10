import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CategoryType } from '@prisma/client';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdCategoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    if (createdCategoryId) {
      await prisma.category
        .delete({ where: { id: createdCategoryId } })
        .catch(() => {});
    }
    await app.close();
  });

  describe('/categories (POST)', () => {
    it('should create a new category', async () => {
      const createDto = {
        name: 'Test Category E2E',
        type: CategoryType.PRODUCT,
        order: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.type).toBe(createDto.type);
      expect(response.body.isActive).toBe(true);

      createdCategoryId = response.body.id;
    });

    it('should fail validation when name is missing', async () => {
      const createDto = {
        type: CategoryType.PRODUCT,
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(400);
    });

    it('should fail validation when type is invalid', async () => {
      const createDto = {
        name: 'Invalid Category',
        type: 'INVALID_TYPE',
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(400);
    });
  });

  describe('/categories (GET)', () => {
    it('should return all active categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('type');
        expect(response.body[0].isActive).toBe(true);
      }
    });
  });

  describe('/categories/:id (GET)', () => {
    it('should return a specific category', async () => {
      if (!createdCategoryId) {
        // Create one for testing
        const createDto = {
          name: 'Test Category for GET',
          type: CategoryType.COMBO,
          order: 2,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/categories')
          .send(createDto);
        createdCategoryId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/categories/${createdCategoryId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdCategoryId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('type');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer()).get('/categories/999999').expect(404);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    it('should update a category', async () => {
      if (!createdCategoryId) {
        const createDto = {
          name: 'Test Category for UPDATE',
          type: CategoryType.PRODUCT,
          order: 3,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/categories')
          .send(createDto);
        createdCategoryId = createResponse.body.id;
      }

      const updateDto = {
        name: 'Updated Category Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${createdCategoryId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(createdCategoryId);
      expect(response.body.name).toBe(updateDto.name);
    });

    it('should return 404 when updating non-existent category', async () => {
      const updateDto = { name: 'Updated' };

      await request(app.getHttpServer())
        .patch('/categories/999999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/categories/:id (DELETE)', () => {
    it('should soft delete a category', async () => {
      // Create a category to delete
      const createDto = {
        name: 'Category to Delete',
        type: CategoryType.PRODUCT,
        order: 4,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .send(createDto);
      const categoryToDelete = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/categories/${categoryToDelete}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Verify it's not in the list anymore
      const listResponse = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const deletedCategory = listResponse.body.find(
        (c: any) => c.id === categoryToDelete,
      );

      expect(deletedCategory).toBeUndefined();
    });

    it('should return 404 when deleting non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/categories/999999')
        .expect(404);
    });
  });
});
