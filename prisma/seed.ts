/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Dados de exemplo dos tipos de produto
const productTypes = [
  { name: 'ALL', order: 1, inUse: true },
  { name: 'COMBO', order: 2, inUse: true },
  { name: 'PORTION', order: 3, inUse: true },
  { name: 'POKES', order: 4, inUse: true },
  { name: 'YAKISOBA', order: 5, inUse: true },
  { name: 'MEGA_HOT', order: 6, inUse: true },
  { name: 'TEMAKI', order: 7, inUse: true },
  { name: 'ITEM', order: 8, inUse: true },
  { name: 'DRINK', order: 9, inUse: true },
  { name: 'OTHER', order: 10, inUse: false },
  { name: 'URAMAKIS', order: 11, inUse: true },
  { name: 'HOTS', order: 12, inUse: true },
  { name: 'HOSSOS', order: 13, inUse: true },
];

// Dados dos produtos (migrados do front-end)
const products = [
  {
    id: 100,
    title: 'Combo Monstro',
    image:
      'https://lh3.googleusercontent.com/d/1duzAizn_mXMxlUYDrZ4_iCeAaR_p7fsC',
    price: 239.9,
    type: 'COMBO',
    order: 1,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 16 },
      { name: 'niguiri salmão cru', quantity: 4 },
      { name: 'niguiri salmão selado', quantity: 4 },
      { name: 'lâminas de salmão cruas', quantity: 10 },
      { name: 'lâminas de salmão seladas', quantity: 10 },
      { name: 'gunkan camarão empanado', quantity: 12 },
      { name: 'gunkan gorgonzola', quantity: 12 },
    ],
  },
  {
    id: 101,
    title: 'Combo Premium',
    image:
      'https://lh3.googleusercontent.com/d/1gwyY36uOZmY0hcehX1uA2rql__vuHT4l',
    price: 169.9,
    type: 'COMBO',
    order: 2,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 8 },
      { name: 'niguiri salmão', quantity: 4 },
      { name: 'lâminas de salmão cruas', quantity: 5 },
      { name: 'lâminas de salmão seladas', quantity: 5 },
      { name: 'gunkan camarão empanado', quantity: 12 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 102,
    title: 'Combo da Casa',
    image:
      'https://lh3.googleusercontent.com/d/11Z8DQ64cVg39UgvJ982g-Ogx5sTlSTuj',
    price: 69.9,
    type: 'COMBO',
    order: 3,
    ingredients: [
      { name: 'gunkan Filadélfia', quantity: 5 },
      { name: 'gunkan alho poró', quantity: 5 },
      { name: 'lâminas de salmão', quantity: 5 },
      { name: 'futomaki skin salmão', quantity: 12 },
    ],
  },
  {
    id: 103,
    title: 'Combo Flash',
    image:
      'https://lh3.googleusercontent.com/d/1Nje2Iqis3hrmP6gobAotUbs8Lz-BXwF5',
    price: 69.9,
    type: 'COMBO',
    order: 4,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 8 },
      { name: 'niguiri skin', quantity: 8 },
      { name: 'uramaki salad', quantity: 8 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 104,
    title: 'Combo Grenal',
    image:
      'https://lh3.googleusercontent.com/d/1R95iR8J9QdVs52PzJwNRoLMn8Z6A_2RR',
    price: 109.9,
    type: 'COMBO',
    order: 5,
    ingredients: [
      { name: 'hossomaki salmão', quantity: 8 },
      { name: 'hossomaki pepino', quantity: 8 },
      { name: 'uramaki Alaska', quantity: 8 },
      { name: 'uramaki Filadélfia', quantity: 8 },
      { name: 'gunkan Alaska', quantity: 8 },
      { name: 'niguiri skin', quantity: 5 },
      { name: 'niguiri salmão', quantity: 5 },
      { name: 'hot Filadélfia', quantity: 20 },
    ],
  },
  {
    id: 105,
    title: 'Combo Almoço',
    image:
      'https://lh3.googleusercontent.com/d/1rkK9pguajUzPNoM1j5o40xmx_n1vd4aG',
    price: 59.9,
    type: 'COMBO',
    order: 6,
    ingredients: [
      { name: 'hossomaki salmão', quantity: 10 },
      { name: 'uramaki Filadélfia', quantity: 10 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 106,
    title: 'Combo Ura',
    image:
      'https://lh3.googleusercontent.com/d/13fdgNmxTEOIxSxL-bVV2q-DUPsv5IK6C',
    price: 34.9,
    type: 'COMBO',
    order: 7,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 8 },
      { name: 'uramaki skin', quantity: 8 },
    ],
  },
  {
    id: 107,
    title: 'Combo Duplo + 2 Temaki Skin',
    image:
      'https://lh3.googleusercontent.com/d/1I4aWuLfm3utWV0RKhSl3fz45q087lJAs',
    price: 79.9,
    type: 'COMBO',
    order: 8,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 5 },
      { name: 'uramaki skin', quantity: 5 },
      { name: 'hossomaki salmão', quantity: 5 },
      { name: 'niguiri salmão', quantity: 5 },
      { name: 'hot Filadélfia', quantity: 10 },
      { name: 'temaki skin', quantity: 2 },
    ],
  },
  {
    id: 108,
    title: 'Combo Duplo + 1 Filadélfia',
    image:
      'https://lh3.googleusercontent.com/d/1rr5eUsPGItU_Z8WkXJoQiRrceXCVfmpB',
    price: 79.9,
    type: 'COMBO',
    order: 9,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 5 },
      { name: 'uramaki skin', quantity: 5 },
      { name: 'hossomaki salmão', quantity: 5 },
      { name: 'niguiri salmão', quantity: 5 },
      { name: 'hot Filadélfia', quantity: 10 },
      { name: 'temaki Filadélfia', quantity: 1 },
    ],
  },
  {
    id: 109,
    title: 'Combo Executivo',
    image:
      'https://lh3.googleusercontent.com/d/1yQ2aqPFl-7uqf6Gy9mo0O6r_3cI9LVaw',
    price: 39.9,
    type: 'COMBO',
    order: 10,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 10 },
      { name: 'gunkan gorgonzola', quantity: 2 },
      { name: 'gunkan Filadélfia', quantity: 2 },
    ],
  },
  {
    id: 110,
    title: 'Combo Gourmet',
    image:
      'https://lh3.googleusercontent.com/d/1oR5mBq_P7K96MGvwnlMENzrHTZU-jc81',
    price: 139.9,
    type: 'COMBO',
    order: 11,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 10 },
      { name: 'niguiri salmão', quantity: 5 },
      { name: 'uramaki skin especial c/ alho poró', quantity: 5 },
      { name: 'gunkan gorgonzola', quantity: 5 },
      { name: 'gunkan camarão alho e óleo', quantity: 5 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 111,
    title: 'Combo Skin Salmão',
    image:
      'https://lh3.googleusercontent.com/d/1zGotjudijDM22uNvySvl2pkgKhTjOYGd',
    price: 79.9,
    type: 'COMBO',
    order: 12,
    ingredients: [
      { name: 'niguiri salmão', quantity: 4 },
      { name: 'niguiri skin', quantity: 4 },
      { name: 'uramaki skin salmão', quantity: 8 },
      { name: 'futomaki skin salmão', quantity: 10 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 112,
    title: 'Combo Ohana',
    image:
      'https://lh3.googleusercontent.com/d/1R7oaZE-50rAc8psgEw1uaZGVMNXs8Hhs',
    price: 129.9,
    type: 'COMBO',
    order: 13,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 8 },
      { name: 'hossomaki salmão', quantity: 8 },
      { name: 'niguiri salmão', quantity: 4 },
      { name: 'gunkan Filadélfia', quantity: 2 },
      { name: 'lâminas de salmão', quantity: 12 },
      { name: 'hot Filadélfia', quantity: 10 },
      { name: 'temaki Filadélfia', quantity: 1 },
    ],
  },
  {
    id: 113,
    title: 'Combo Super Hot',
    image:
      'https://lh3.googleusercontent.com/d/1kUZgkoBi1VcNz0IdB4o41h_-CUlV3V6a',
    price: 89.9,
    type: 'COMBO',
    order: 14,
    ingredients: [
      { name: 'hot couve', quantity: 20 },
      { name: 'hot alho poró', quantity: 20 },
      { name: 'hot Filadélfia', quantity: 10 },
    ],
  },
  {
    id: 114,
    title: 'Combo Gunkan',
    image:
      'https://lh3.googleusercontent.com/d/1FtkghmHoXkp_NqHlEQDQBAC5rdlDq9Db',
    price: 189.9,
    type: 'COMBO',
    order: 15,
    ingredients: [
      { name: 'gunkan alho poró', quantity: 5 },
      { name: 'gunkan camarão alho e óleo', quantity: 5 },
      { name: 'gunkan camarão empanado', quantity: 5 },
      { name: 'gunkan Filadélfia', quantity: 5 },
      { name: 'gunkan Filadélfia selado', quantity: 5 },
      { name: 'gunkan gorgonzola', quantity: 5 },
      { name: 'gunkan Alaska', quantity: 10 },
    ],
  },
  {
    id: 115,
    title: 'Combo do Chefe',
    image:
      'https://lh3.googleusercontent.com/d/1cdzKKqlmZtJR6dzwsEJCklRSgfBy0ld8',
    price: 259.9,
    type: 'COMBO',
    order: 16,
    ingredients: [
      { name: 'uramaki Filadélfia', quantity: 16 },
      { name: 'hossomaki salmão', quantity: 16 },
      { name: 'niguiri salmão cru', quantity: 4 },
      { name: 'niguiri salmão selado', quantity: 4 },
      { name: 'lâminas de salmão cruas', quantity: 10 },
      { name: 'lâminas de salmão seladas', quantity: 10 },
      { name: 'gunkan gorgonzola', quantity: 10 },
      { name: 'gunkan Filadélfia', quantity: 10 },
      { name: 'hot gourmet', quantity: 30 },
    ],
  },
  {
    id: 200,
    title: 'Gunkan Camarão Empanado',
    image:
      'https://lh3.googleusercontent.com/d/1dodf8-An9hkFVy3yfWQkani1a5o5T6An',
    price: 18.9,
    type: 'PORTION',
    order: 1,
    ingredients: [],
  },
  {
    id: 201,
    title: 'Hot Alho poró',
    image:
      'https://lh3.googleusercontent.com/d/1CPfyfFrY8Iqco2j8QmWDOHsr7ZcVNbgO',
    price: 21.9,
    type: 'PORTION',
    order: 2,
    ingredients: [],
  },
  {
    id: 202,
    title: 'Gunkan Gorgonzola',
    image:
      'https://lh3.googleusercontent.com/d/1tYbiicvogPTxX9lxIHy5tOUsp7w83awa',
    price: 17.9,
    type: 'PORTION',
    order: 3,
    ingredients: [],
  },
  {
    id: 300,
    title: 'Poke Filadélfia',
    image:
      'https://lh3.googleusercontent.com/d/1xRDsV_znRQ6T8nzlRCq02CZpCSVRqSzm',
    price: 54.9,
    type: 'POKES',
    order: 1,
    ingredients: [],
  },
  {
    id: 301,
    title: 'Poke Ohana',
    image:
      'https://lh3.googleusercontent.com/d/1nP8Vq--keB44Tw0JPfdB6DltRGLVEq61',
    price: 64.9,
    type: 'POKES',
    order: 2,
    ingredients: [],
  },
  {
    id: 400,
    title: 'Yakisoba de Frango',
    image:
      'https://lh3.googleusercontent.com/d/1yzvFU_U6XaahagvsbwtJQZUL4iuUSzT0',
    price: 0,
    type: 'YAKISOBA',
    order: 1,
    ingredients: [],
  },
  {
    id: 401,
    title: 'Yakisoba de Carne',
    image:
      'https://lh3.googleusercontent.com/d/1zOWKZGoAJZDXDnzulh7WFmBXsCzL281p',
    price: 0,
    type: 'YAKISOBA',
    order: 2,
    ingredients: [],
  },
  {
    id: 500,
    title: 'Mega Hot Filadélfia',
    image:
      'https://lh3.googleusercontent.com/d/1Ju0sHeZ3CTkdRl39fgX1j8H75lB_R4GU',
    price: 0,
    type: 'MEGA_HOT',
    order: 1,
    ingredients: [],
  },
  {
    id: 600,
    title: 'Temaki Hot',
    image:
      'https://lh3.googleusercontent.com/d/1DjUiSyNrhPTIPY2Z18oiaFycOnztGaQ9',
    price: 0,
    type: 'TEMAKI',
    order: 1,
    ingredients: [],
  },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...');
  await prisma.ingredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productType.deleteMany();

  // Criar tipos de produto
  console.log('📦 Criando tipos de produto...');
  const typeMap: Record<string, number> = {};

  for (const type of productTypes) {
    const createdType = await prisma.productType.create({
      data: {
        name: type.name,
        order: type.order,
        inUse: type.inUse,
      },
    });
    typeMap[type.name] = createdType.id;
    console.log(`   ✓ Tipo criado: ${type.name} (ordem: ${type.order})`);
  }

  // Criar produtos com ingredientes
  console.log('🍣 Criando produtos...');
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        order: product.order,
        productTypeId: typeMap[product.type],
        ingredients: {
          create: product.ingredients,
        },
      },
    });
    console.log(`   ✓ Produto criado: ${product.title}`);
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${productTypes.length} tipos de produto`);
  console.log(`   - ${products.length} produtos`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
