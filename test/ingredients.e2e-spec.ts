import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('IngredientsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdIngredientId: number;

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
    if (createdIngredientId) {
      await prisma.ingredient
        .delete({ where: { id: createdIngredientId } })
        .catch(() => {});
    }
    await app.close();
  });

  describe('/ingredients (POST)', () => {
    it('should create a new ingredient', async () => {
      const createDto = {
        name: 'Test Ingredient E2E',
        isAllergenic: false,
      };

      const response = await request(app.getHttpServer())
        .post('/ingredients')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.isAllergenic).toBe(createDto.isAllergenic);

      createdIngredientId = response.body.id;
    });

    it('should create an allergenic ingredient', async () => {
      const createDto = {
        name: 'Amendoim E2E',
        isAllergenic: true,
      };

      const response = await request(app.getHttpServer())
        .post('/ingredients')
        .send(createDto)
        .expect(201);

      expect(response.body.isAllergenic).toBe(true);

      // Clean up
      await prisma.ingredient.delete({ where: { id: response.body.id } });
    });

    it('should fail validation when name is missing', async () => {
      const createDto = {
        isAllergenic: false,
      };

      await request(app.getHttpServer())
        .post('/ingredients')
        .send(createDto)
        .expect(400);
    });

    it('should fail validation when isAllergenic is not boolean', async () => {
      const createDto = {
        name: 'Invalid Ingredient',
        isAllergenic: 'not-a-boolean',
      };

      await request(app.getHttpServer())
        .post('/ingredients')
        .send(createDto)
        .expect(400);
    });
  });

  describe('/ingredients (GET)', () => {
    it('should return all ingredients', async () => {
      const response = await request(app.getHttpServer())
        .get('/ingredients')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('isAllergenic');
      }
    });
  });

  describe('/ingredients/:id (GET)', () => {
    it('should return a specific ingredient', async () => {
      if (!createdIngredientId) {
        const createDto = {
          name: 'Test Ingredient for GET',
          isAllergenic: false,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/ingredients')
          .send(createDto);
        createdIngredientId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/ingredients/${createdIngredientId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdIngredientId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('isAllergenic');
    });

    it('should return 404 for non-existent ingredient', async () => {
      await request(app.getHttpServer()).get('/ingredients/999999').expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      await request(app.getHttpServer())
        .get('/ingredients/invalid')
        .expect(400);
    });
  });

  describe('/ingredients/:id (PATCH)', () => {
    it('should update an ingredient', async () => {
      if (!createdIngredientId) {
        const createDto = {
          name: 'Test Ingredient for UPDATE',
          isAllergenic: false,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/ingredients')
          .send(createDto);
        createdIngredientId = createResponse.body.id;
      }

      const updateDto = {
        name: 'Updated Ingredient Name',
        isAllergenic: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/ingredients/${createdIngredientId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(createdIngredientId);
      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.isAllergenic).toBe(updateDto.isAllergenic);
    });

    it('should return 404 when updating non-existent ingredient', async () => {
      const updateDto = { name: 'Updated' };

      await request(app.getHttpServer())
        .patch('/ingredients/999999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/ingredients/:id (DELETE)', () => {
    it('should delete an ingredient', async () => {
      // Create an ingredient to delete
      const createDto = {
        name: 'Ingredient to Delete',
        isAllergenic: false,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/ingredients')
        .send(createDto);
      const ingredientToDelete = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/ingredients/${ingredientToDelete}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/ingredients/${ingredientToDelete}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent ingredient', async () => {
      await request(app.getHttpServer())
        .delete('/ingredients/999999')
        .expect(404);
    });
  });
});
