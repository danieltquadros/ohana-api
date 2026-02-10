import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CombosController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdComboId: number;

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
    // Clean up test data - delete all test combos
    await prisma.combo
      .deleteMany({
        where: {
          OR: [
            { name: { contains: 'Test Combo' } },
            { name: { contains: 'Combo to Delete' } },
            { name: { contains: 'Invalid Combo' } },
            { name: { contains: 'Incomplete Combo' } },
            { name: { contains: 'Updated' } },
          ],
        },
      })
      .catch(() => {});
    await app.close();
  });

  describe('/combos (POST)', () => {
    it('should create a new combo', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const createDto = {
        name: 'Test Combo E2E',
        description: 'E2E test combo',
        image: 'test-combo.jpg',
        price: 99.9,
        discount: 10.0,
        validFrom: tomorrow.toISOString(),
        validUntil: nextMonth.toISOString(),
        order: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/combos')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.description).toBe(createDto.description);
      expect(parseFloat(response.body.price)).toBe(createDto.price);
      expect(parseFloat(response.body.discount)).toBe(createDto.discount);
      expect(response.body.isActive).toBe(true);

      createdComboId = response.body.id;
    });

    it('should fail validation when required fields are missing', async () => {
      const createDto = {
        name: 'Incomplete Combo',
      };

      await request(app.getHttpServer())
        .post('/combos')
        .send(createDto)
        .expect(400);
    });

    it.skip('should fail validation when price is negative', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const createDto = {
        name: 'Invalid Combo',
        description: 'Test',
        image: 'test.jpg',
        price: -10.0,
        discount: 0,
        validFrom: tomorrow.toISOString(),
        validUntil: nextMonth.toISOString(),
        order: 1,
      };

      await request(app.getHttpServer())
        .post('/combos')
        .send(createDto)
        .expect(400);
    });
  });

  describe('/combos (GET)', () => {
    it('should return all active combos', async () => {
      const response = await request(app.getHttpServer())
        .get('/combos')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('price');
        expect(response.body[0].isActive).toBe(true);
      }
    });
  });

  describe('/combos/active (GET)', () => {
    it('should return only currently valid combos', async () => {
      const response = await request(app.getHttpServer())
        .get('/combos/active')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // All returned combos should be within valid date range
      const now = new Date();
      response.body.forEach((combo: any) => {
        const validFrom = new Date(combo.validFrom);
        const validUntil = new Date(combo.validUntil);
        expect(validFrom <= now).toBe(true);
        expect(validUntil >= now).toBe(true);
      });
    });
  });

  describe('/combos/:id (GET)', () => {
    it('should return a specific combo', async () => {
      if (!createdComboId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const createDto = {
          name: 'Test Combo for GET',
          description: 'Test',
          image: 'test.jpg',
          price: 89.9,
          discount: 5.0,
          validFrom: tomorrow.toISOString(),
          validUntil: nextMonth.toISOString(),
          order: 2,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/combos')
          .send(createDto);
        createdComboId = createResponse.body.id;
      }

      const response = await request(app.getHttpServer())
        .get(`/combos/${createdComboId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdComboId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent combo', async () => {
      await request(app.getHttpServer()).get('/combos/999999').expect(404);
    });
  });

  describe('/combos/:id (PATCH)', () => {
    it('should update a combo', async () => {
      if (!createdComboId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const createDto = {
          name: 'Test Combo for UPDATE',
          description: 'Test',
          image: 'test.jpg',
          price: 79.9,
          discount: 0,
          validFrom: tomorrow.toISOString(),
          validUntil: nextMonth.toISOString(),
          order: 3,
        };
        const createResponse = await request(app.getHttpServer())
          .post('/combos')
          .send(createDto);
        createdComboId = createResponse.body.id;
      }

      const updateDto = {
        name: 'Updated Combo Name',
        price: 109.9,
      };

      const response = await request(app.getHttpServer())
        .patch(`/combos/${createdComboId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(createdComboId);
      expect(response.body.name).toBe(updateDto.name);
      expect(parseFloat(response.body.price)).toBe(updateDto.price);
    });

    it('should return 404 when updating non-existent combo', async () => {
      const updateDto = { name: 'Updated' };

      await request(app.getHttpServer())
        .patch('/combos/999999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/combos/:id (DELETE)', () => {
    it('should soft delete a combo', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Create a combo to delete
      const createDto = {
        name: `Combo to Delete ${Date.now()}`,
        description: 'Will be deleted',
        image: 'delete.jpg',
        price: 49.9,
        discount: 0,
        validFrom: tomorrow.toISOString(),
        validUntil: nextMonth.toISOString(),
        order: 4,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/combos')
        .send(createDto);
      const comboToDelete = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/combos/${comboToDelete}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);

      // Verify it's not in the active list
      const listResponse = await request(app.getHttpServer())
        .get('/combos')
        .expect(200);

      const deletedCombo = listResponse.body.find(
        (c: any) => c.id === comboToDelete,
      );
      expect(deletedCombo).toBeUndefined();
    });

    it('should return 404 when deleting non-existent combo', async () => {
      await request(app.getHttpServer()).delete('/combos/999999').expect(404);
    });
  });
});
