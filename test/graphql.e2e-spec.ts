import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CategoryType } from '@prisma/client';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const graphqlRequest = (query: string, variables?: any) => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });
  };

  describe('Products Queries', () => {
    it('should query all products', async () => {
      const query = `
        query {
          products {
            id
            title
            price
            isActive
            type {
              id
              name
            }
            ingredients {
              quantity
              ingredient {
                name
                isAllergenic
              }
            }
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('products');
      expect(Array.isArray(response.body.data.products)).toBe(true);

      if (response.body.data.products.length > 0) {
        const product = response.body.data.products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('type');
        expect(product).toHaveProperty('ingredients');
      }
    });

    it('should query a single product by id', async () => {
      // First get a product id
      const allProductsQuery = `
        query {
          products {
            id
          }
        }
      `;
      const allProductsResponse = await graphqlRequest(allProductsQuery);
      const productId = allProductsResponse.body.data.products[0]?.id;

      if (productId) {
        const query = `
          query GetProduct($id: Int!) {
            product(id: $id) {
              id
              title
              price
              image
              order
              isActive
              type {
                name
              }
              category {
                name
              }
            }
          }
        `;

        const response = await graphqlRequest(query, { id: productId }).expect(
          200,
        );

        expect(response.body.data.product).toHaveProperty('id', productId);
        expect(response.body.data.product).toHaveProperty('title');
        expect(response.body.data.product).toHaveProperty('type');
      }
    });

    it('should query products by type', async () => {
      const query = `
        query {
          productsByType(typeId: 1) {
            id
            title
            productTypeId
            type {
              name
            }
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('productsByType');
      expect(Array.isArray(response.body.data.productsByType)).toBe(true);

      // All products should have typeId 1
      response.body.data.productsByType.forEach((product: any) => {
        expect(product.productTypeId).toBe(1);
      });
    });

    it('should query products by category', async () => {
      const query = `
        query {
          productsByCategory(categoryId: 1) {
            id
            title
            categoryId
            category {
              name
            }
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('productsByCategory');
      expect(Array.isArray(response.body.data.productsByCategory)).toBe(true);

      // All products should have categoryId 1
      response.body.data.productsByCategory.forEach((product: any) => {
        expect(product.categoryId).toBe(1);
      });
    });
  });

  describe('Categories Queries', () => {
    it('should query all categories', async () => {
      const query = `
        query {
          categories {
            id
            name
            type
            isActive
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('categories');
      expect(Array.isArray(response.body.data.categories)).toBe(true);

      if (response.body.data.categories.length > 0) {
        const category = response.body.data.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('type');
        expect(category.isActive).toBe(true);
      }
    });

    it('should create a category mutation', async () => {
      const mutation = `
        mutation CreateCategory($input: CreateCategoryInput!) {
          createCategory(createCategoryInput: $input) {
            id
            name
            type
            isActive
          }
        }
      `;

      const variables = {
        input: {
          name: 'GraphQL Test Category',
          type: CategoryType.PRODUCT,
          order: 1,
        },
      };

      const response = await graphqlRequest(mutation, variables).expect(200);

      expect(response.body.data.createCategory).toHaveProperty('id');
      expect(response.body.data.createCategory.name).toBe(
        'GraphQL Test Category',
      );
      expect(response.body.data.createCategory.type).toBe(CategoryType.PRODUCT);

      // Clean up
      await prisma.category.delete({
        where: { id: response.body.data.createCategory.id },
      });
    });
  });

  describe('Ingredients Queries', () => {
    it('should query all ingredients', async () => {
      const query = `
        query {
          ingredients {
            id
            name
            isAllergenic
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('ingredients');
      expect(Array.isArray(response.body.data.ingredients)).toBe(true);

      if (response.body.data.ingredients.length > 0) {
        const ingredient = response.body.data.ingredients[0];
        expect(ingredient).toHaveProperty('id');
        expect(ingredient).toHaveProperty('name');
        expect(ingredient).toHaveProperty('isAllergenic');
      }
    });

    it('should create an ingredient mutation', async () => {
      const mutation = `
        mutation CreateIngredient($input: CreateIngredientInput!) {
          createIngredient(createIngredientInput: $input) {
            id
            name
            isAllergenic
          }
        }
      `;

      const variables = {
        input: {
          name: 'GraphQL Test Ingredient',
          isAllergenic: false,
        },
      };

      const response = await graphqlRequest(mutation, variables).expect(200);
      expect(response.body.data.createIngredient).toHaveProperty('id');
      expect(response.body.data.createIngredient.name).toBe(
        'GraphQL Test Ingredient',
      );

      // Clean up
      await prisma.ingredient.delete({
        where: { id: response.body.data.createIngredient.id },
      });
    });
  });

  describe('Combos Queries', () => {
    it('should query all combos', async () => {
      const query = `
        query {
          combos {
            id
            name
            description
            price
            discount
            isActive
            validFrom
            validUntil
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('combos');
      expect(Array.isArray(response.body.data.combos)).toBe(true);

      if (response.body.data.combos.length > 0) {
        const combo = response.body.data.combos[0];
        expect(combo).toHaveProperty('id');
        expect(combo).toHaveProperty('name');
        expect(combo).toHaveProperty('price');
        expect(combo.isActive).toBe(true);
      }
    });

    it('should query active combos', async () => {
      const query = `
        query {
          activeCombos {
            id
            name
            validFrom
            validUntil
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body.data).toHaveProperty('activeCombos');
      expect(Array.isArray(response.body.data.activeCombos)).toBe(true);

      // Verify all combos are within valid date range
      const now = new Date();
      response.body.data.activeCombos.forEach((combo: any) => {
        const validFrom = new Date(combo.validFrom);
        const validUntil = new Date(combo.validUntil);
        expect(validFrom <= now).toBe(true);
        expect(validUntil >= now).toBe(true);
      });
    });

    it('should create a combo mutation', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const mutation = `
        mutation CreateCombo($input: CreateComboInput!) {
          createCombo(createComboInput: $input) {
            id
            name
            description
            price
            discount
            validFrom
            validUntil
          }
        }
      `;

      const variables = {
        input: {
          name: 'GraphQL Test Combo',
          description: 'Test combo from GraphQL',
          image: 'test.jpg',
          price: 99.9,
          discount: 10.0,
          validFrom: tomorrow.toISOString(),
          validUntil: nextMonth.toISOString(),
          order: 1,
        },
      };

      const response = await graphqlRequest(mutation, variables).expect(200);

      expect(response.body.data.createCombo).toHaveProperty('id');
      expect(response.body.data.createCombo.name).toBe('GraphQL Test Combo');

      // Clean up
      await prisma.combo.delete({
        where: { id: response.body.data.createCombo.id },
      });
    });
  });

  describe('Error Handling', () => {
    it('should return error for invalid query', async () => {
      const query = `
        query {
          nonExistentQuery {
            id
          }
        }
      `;

      const response = await graphqlRequest(query).expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return error for non-existent product', async () => {
      const query = `
        query {
          product(id: 999999) {
            id
            title
          }
        }
      `;

      const response = await graphqlRequest(query).expect(200);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
