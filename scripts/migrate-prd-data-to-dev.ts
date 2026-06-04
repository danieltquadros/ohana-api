/**
 * Script de migração: dados de PRD → DEV (formato novo)
 *
 * Objetivo: reorganizar dados do menu Ohana Sushi seguindo a nova
 * estrutura do schema. Em PRD, combos foram cadastrados como Products
 * (type=COMBO) e os componentes desses combos foram cadastrados como
 * Ingredients. Esta migração corrige isso:
 *
 *   - Combos viram registros em `combos`
 *   - Componentes (atualmente em `ingredients`) viram registros em
 *     `products` (type=PORTION, sem imagem, price=0)
 *   - Vínculos combo↔componente viram registros em `combo_products`
 *   - Tabela `ingredients` fica vazia (a admin do sushi vai cadastrar
 *     ingredientes reais depois)
 *
 * IMPORTANTE: este script DELETA todos os dados das tabelas relevantes
 * em DEV antes de inserir. Use com cuidado.
 *
 * Uso:
 *   npm run ts-script scripts/migrate-prd-data-to-dev.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// DADOS DE PRD (snapshot extraído via API)
// ============================================================

const PRODUCT_TYPES = [
  { name: 'COMBO', order: 1, inUse: true },
  { name: 'TEMAKI', order: 2, inUse: true },
  { name: 'MEGA_HOT', order: 3, inUse: true },
  { name: 'POKES', order: 4, inUse: true },
  { name: 'PORTION', order: 5, inUse: true },
  { name: 'YAKISOBA', order: 6, inUse: true },
];

const CATEGORIES = [
  {
    name: 'Premium',
    description: 'Produtos especiais',
    type: 'PRODUCT' as const,
    order: 1,
    isActive: true,
  },
  {
    name: 'Tradicional',
    description: 'Clássicos',
    type: 'PRODUCT' as const,
    order: 2,
    isActive: true,
  },
];

// Produtos não-COMBO (vão pra `products` mantendo type/categoria)
const REAL_PRODUCTS = [
  {
    title: 'Gunkan Camarão Empanado',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382221/ohana/products/krge1axub61ie3lrylot.jpg',
    price: 18.9,
    order: 1,
    typeName: 'PORTION',
    categoryName: 'Tradicional',
  },
  {
    title: 'Poke Filadélfia',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382310/ohana/products/yvefg3yz7ue19kg1udvp.jpg',
    price: 54.9,
    order: 1,
    typeName: 'POKES',
    categoryName: 'Tradicional',
  },
  {
    title: 'Temaki Hot',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382401/ohana/products/hher0goqrkk03hn0tknm.jpg',
    price: 0,
    order: 1,
    typeName: 'TEMAKI',
    categoryName: 'Tradicional',
  },
  {
    title: 'Yakisoba de Frango',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382424/ohana/products/y14byo5wvkrkypfrorwo.jpg',
    price: 0,
    order: 1,
    typeName: 'YAKISOBA',
    categoryName: 'Tradicional',
  },
  {
    title: 'Mega Hot Filadélfia',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382568/ohana/products/h9vfo4bsmum4s56ze2as.jpg',
    price: 0,
    order: 1,
    typeName: 'MEGA_HOT',
    categoryName: 'Tradicional',
  },
  {
    title: 'Poke Ohana',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382336/ohana/products/huzls6nabbjst7huiqav.jpg',
    price: 64.9,
    order: 2,
    typeName: 'POKES',
    categoryName: 'Tradicional',
  },
  {
    title: 'Yakisoba de Carne',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382493/ohana/products/werhtnvewz0ver2cwhfn.jpg',
    price: 0,
    order: 2,
    typeName: 'YAKISOBA',
    categoryName: 'Tradicional',
  },
  {
    title: 'Hot Alho poró',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382250/ohana/products/q4rhrepwhkmvi0pdbjg5.jpg',
    price: 23.9,
    order: 2,
    typeName: 'PORTION',
    categoryName: 'Tradicional',
  },
  {
    title: 'Gunkan Gorgonzola',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382281/ohana/products/rbzwmkcvhqrbsjh4hubo.jpg',
    price: 17.9,
    order: 3,
    typeName: 'PORTION',
    categoryName: 'Tradicional',
  },
];

// Componentes (atualmente em `ingredients` em PRD) que vão virar Products
// type=PORTION conforme decisão da migração v1
const COMPONENT_PRODUCTS_AS_PORTION = [
  'Futomaki skin salmão',
  'Gunkan alaska',
  'Gunkan alho poró',
  'Gunkan camarão alho e óleo',
  'Gunkan filadélfia',
  'Gunkan filadélfia selado',
  'Gunkan gorgonzola',
  'Hossomaki pepino',
  'Hossomaki salmão',
  'Hot alho poró',
  'Hot couve',
  'Hot filadélfia',
  'Hot gourmet',
  'Lâminas de salmão',
  'Lâminas de salmão cruas',
  'Lâminas de salmão seladas',
  'Niguiri salmão',
  'Niguiri salmão cru',
  'Niguiri salmão selado',
  'Niguiri skin',
  'Temaki filadélfia',
  'Temaki skin',
  'Uramaki alaska',
  'Uramaki filadélfia',
  'Uramaki salad',
  'Uramaki skin',
  'Uramaki skin especial c/ alho poró',
  'Uramaki skin salmão',
];

// Combos (mapeados de PRD). Cada entrada de `products` aponta pra um
// componente pelo NOME (será resolvido pra productId no momento da criação).
const COMBOS = [
  {
    name: 'Combo Monstro',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381482/ohana/products/wm7btgidjsbp5ct2qs18.jpg',
    price: 249.9,
    order: 1,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 16, order: 1 },
      { name: 'Niguiri salmão cru', quantity: 4, order: 2 },
      { name: 'Niguiri salmão selado', quantity: 4, order: 3 },
      { name: 'Lâminas de salmão cruas', quantity: 10, order: 4 },
      { name: 'Lâminas de salmão seladas', quantity: 10, order: 5 },
      { name: 'Gunkan camarão empanado', quantity: 12, order: 6 },
      { name: 'Gunkan gorgonzola', quantity: 12, order: 7 },
    ],
  },
  {
    name: 'Combo Premium',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381557/ohana/products/wumysfbsmkffrtll5qjw.jpg',
    price: 179.9,
    order: 2,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 8, order: 1 },
      { name: 'Niguiri salmão', quantity: 4, order: 2 },
      { name: 'Lâminas de salmão cruas', quantity: 5, order: 3 },
      { name: 'Lâminas de salmão seladas', quantity: 5, order: 4 },
      { name: 'Gunkan camarão empanado', quantity: 12, order: 5 },
      { name: 'Hot filadélfia', quantity: 10, order: 6 },
    ],
  },
  {
    name: 'Combo da Casa',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381622/ohana/products/qsofaxivhnwg9wpbf8va.jpg',
    price: 79.9,
    order: 3,
    categoryName: 'Premium',
    products: [
      { name: 'Gunkan filadélfia', quantity: 5, order: 1 },
      { name: 'Gunkan alho poró', quantity: 5, order: 2 },
      { name: 'Lâminas de salmão', quantity: 5, order: 3 },
      { name: 'Futomaki skin salmão', quantity: 12, order: 4 },
    ],
  },
  {
    name: 'Combo Flash',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381667/ohana/products/unsk5qzngiyx7zkxvyrq.jpg',
    price: 79.9,
    order: 4,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 8, order: 1 },
      { name: 'Niguiri skin', quantity: 8, order: 2 },
      { name: 'Uramaki salad', quantity: 8, order: 3 },
      { name: 'Hot filadélfia', quantity: 10, order: 4 },
    ],
  },
  {
    name: 'Combo Grenal',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381697/ohana/products/y1jjlpwd3m0aom8xofno.jpg',
    price: 119.9,
    order: 5,
    categoryName: 'Premium',
    products: [
      { name: 'Hossomaki salmão', quantity: 8, order: 1 },
      { name: 'Hossomaki pepino', quantity: 8, order: 2 },
      { name: 'Uramaki alaska', quantity: 8, order: 3 },
      { name: 'Uramaki filadélfia', quantity: 8, order: 4 },
      { name: 'Gunkan alaska', quantity: 8, order: 5 },
      { name: 'Niguiri skin', quantity: 5, order: 6 },
      { name: 'Niguiri salmão', quantity: 5, order: 7 },
      { name: 'Hot filadélfia', quantity: 20, order: 8 },
    ],
  },
  {
    name: 'Combo Almoço',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381758/ohana/products/gj3b40hiys86juiguhhn.jpg',
    price: 69.9,
    order: 6,
    categoryName: 'Premium',
    products: [
      { name: 'Hossomaki salmão', quantity: 10, order: 1 },
      { name: 'Uramaki filadélfia', quantity: 10, order: 2 },
      { name: 'Hot filadélfia', quantity: 10, order: 3 },
    ],
  },
  {
    name: 'Combo Ura',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381785/ohana/products/wtn4uppbx2uigrv4txi7.jpg',
    price: 39.9,
    order: 7,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 8, order: 1 },
      { name: 'Uramaki skin', quantity: 8, order: 2 },
    ],
  },
  {
    name: 'Combo Duplo + 2 Temaki Skin',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381820/ohana/products/ajagflcfuyxtm7ble4wu.jpg',
    price: 89.9,
    order: 8,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 5, order: 1 },
      { name: 'Uramaki skin', quantity: 5, order: 2 },
      { name: 'Hossomaki salmão', quantity: 5, order: 3 },
      { name: 'Niguiri salmão', quantity: 5, order: 4 },
      { name: 'Hot filadélfia', quantity: 10, order: 5 },
      { name: 'Temaki skin', quantity: 2, order: 6 },
    ],
  },
  {
    name: 'Combo Duplo + 1 Filadélfia',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381875/ohana/products/bt1cqtp5potnb0pehrhj.jpg',
    price: 89.9,
    order: 9,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 5, order: 1 },
      { name: 'Uramaki skin', quantity: 5, order: 2 },
      { name: 'Hossomaki salmão', quantity: 5, order: 3 },
      { name: 'Niguiri salmão', quantity: 5, order: 4 },
      { name: 'Hot filadélfia', quantity: 10, order: 5 },
      { name: 'Temaki filadélfia', quantity: 1, order: 6 },
    ],
  },
  {
    name: 'Combo Executivo',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381917/ohana/products/dcwc6a506pzkqxorvlfq.jpg',
    price: 49.9,
    order: 10,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 10, order: 1 },
      { name: 'Gunkan gorgonzola', quantity: 2, order: 2 },
      { name: 'Gunkan filadélfia', quantity: 2, order: 3 },
    ],
  },
  {
    name: 'Combo Gourmet',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776381961/ohana/products/m2pkqfockjohc3kcig7m.jpg',
    price: 149.9,
    order: 11,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 10, order: 1 },
      { name: 'Niguiri salmão', quantity: 5, order: 2 },
      { name: 'Uramaki skin especial c/ alho poró', quantity: 5, order: 3 },
      { name: 'Gunkan gorgonzola', quantity: 5, order: 4 },
      { name: 'Gunkan camarão alho e óleo', quantity: 5, order: 5 },
      { name: 'Hot filadélfia', quantity: 10, order: 6 },
    ],
  },
  {
    name: 'Combo Skin Salmão',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382011/ohana/products/mvtul5hcjz7p1dokdugc.jpg',
    price: 89.9,
    order: 12,
    categoryName: 'Premium',
    products: [
      { name: 'Niguiri salmão', quantity: 4, order: 1 },
      { name: 'Niguiri skin', quantity: 4, order: 2 },
      { name: 'Uramaki skin salmão', quantity: 8, order: 3 },
      { name: 'Futomaki skin salmão', quantity: 10, order: 4 },
      { name: 'Hot filadélfia', quantity: 10, order: 5 },
    ],
  },
  {
    name: 'Combo Ohana',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382056/ohana/products/wulcuhrdjvaoavk9wnn7.jpg',
    price: 149.9,
    order: 13,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 8, order: 1 },
      { name: 'Hossomaki salmão', quantity: 8, order: 2 },
      { name: 'Niguiri salmão', quantity: 4, order: 3 },
      { name: 'Gunkan filadélfia', quantity: 2, order: 4 },
      { name: 'Lâminas de salmão', quantity: 12, order: 5 },
      { name: 'Hot filadélfia', quantity: 10, order: 6 },
      { name: 'Temaki filadélfia', quantity: 1, order: 7 },
    ],
  },
  {
    name: 'Combo Super Hot',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382098/ohana/products/lgldp8waigkgwbtvjwh6.jpg',
    price: 89.9,
    order: 14,
    categoryName: 'Premium',
    products: [
      { name: 'Hot couve', quantity: 20, order: 1 },
      { name: 'Hot alho poró', quantity: 20, order: 2 },
      { name: 'Hot filadélfia', quantity: 10, order: 3 },
    ],
  },
  {
    name: 'Combo Gunkan',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382146/ohana/products/wcrlvhyuyzyhkqh4olef.jpg',
    price: 189.9,
    order: 15,
    categoryName: 'Premium',
    products: [
      { name: 'Gunkan alho poró', quantity: 5, order: 1 },
      { name: 'Gunkan camarão alho e óleo', quantity: 5, order: 2 },
      { name: 'Gunkan camarão empanado', quantity: 5, order: 3 },
      { name: 'Gunkan filadélfia', quantity: 5, order: 4 },
      { name: 'Gunkan filadélfia selado', quantity: 5, order: 5 },
      { name: 'Gunkan gorgonzola', quantity: 5, order: 6 },
      { name: 'Gunkan alaska', quantity: 10, order: 7 },
    ],
  },
  {
    name: 'Combo do Chefe',
    image:
      'https://res.cloudinary.com/dtowttqc9/image/upload/v1776382180/ohana/products/nmriylq4ppqirhbryj8w.jpg',
    price: 269.9,
    order: 16,
    categoryName: 'Premium',
    products: [
      { name: 'Uramaki filadélfia', quantity: 16, order: 1 },
      { name: 'Hossomaki salmão', quantity: 16, order: 2 },
      { name: 'Niguiri salmão cru', quantity: 4, order: 3 },
      { name: 'Niguiri salmão selado', quantity: 4, order: 4 },
      { name: 'Lâminas de salmão cruas', quantity: 10, order: 5 },
      { name: 'Lâminas de salmão seladas', quantity: 10, order: 6 },
      { name: 'Gunkan gorgonzola', quantity: 10, order: 7 },
      { name: 'Gunkan filadélfia', quantity: 10, order: 8 },
      { name: 'Hot gourmet', quantity: 30, order: 9 },
    ],
  },
];

// ============================================================
// SCRIPT PRINCIPAL
// ============================================================

async function main() {
  console.log('🍣 Migração de dados PRD → DEV');
  console.log('Banco alvo:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? '(desconhecido)');
  console.log();

  // 1. Limpar tabelas em ordem (respeitando FKs)
  console.log('🧹 Limpando tabelas existentes...');
  await prisma.comboProductSubstitution.deleteMany();
  await prisma.comboProduct.deleteMany();
  await prisma.productIngredient.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.productType.deleteMany();
  console.log('   ✓ Tabelas limpas');

  // 2. Resetar sequences (autoincrement) — começa do 1
  console.log('🔢 Resetando sequences...');
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('combo_product_substitutions', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('combo_products', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('product_ingredients', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('combos', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('products', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('ingredients', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('categories', 'id'), 1, false);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('product_types', 'id'), 1, false);`,
  );
  console.log('   ✓ Sequences resetadas');

  // 3. Criar Product Types
  console.log('📂 Criando product types...');
  const typeIdByName = new Map<string, number>();
  for (const t of PRODUCT_TYPES) {
    const created = await prisma.productType.create({ data: t });
    typeIdByName.set(t.name, created.id);
    console.log(`   ✓ ${t.name} (id=${created.id})`);
  }

  // 4. Criar Categories
  console.log('🗂️  Criando categories...');
  const categoryIdByName = new Map<string, number>();
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({ data: c });
    categoryIdByName.set(c.name, created.id);
    console.log(`   ✓ ${c.name} (id=${created.id})`);
  }

  // 5. Criar produtos reais (9)
  console.log('🍱 Criando produtos reais (9)...');
  const productIdByLowerName = new Map<string, number>();
  for (const p of REAL_PRODUCTS) {
    const typeId = typeIdByName.get(p.typeName);
    const categoryId = categoryIdByName.get(p.categoryName);
    if (!typeId || !categoryId) {
      throw new Error(`Tipo/categoria não encontrados pra ${p.title}`);
    }
    const created = await prisma.product.create({
      data: {
        title: p.title,
        image: p.image,
        price: p.price,
        order: p.order,
        isActive: true,
        productTypeId: typeId,
        categoryId,
      },
    });
    productIdByLowerName.set(p.title.toLowerCase(), created.id);
    console.log(`   ✓ ${p.title} (id=${created.id})`);
  }

  // 6. Criar componentes como produtos PORTION
  console.log('🧩 Criando componentes como produtos PORTION...');
  const portionTypeId = typeIdByName.get('PORTION');
  const tradicionalCategoryId = categoryIdByName.get('Tradicional');
  if (!portionTypeId || !tradicionalCategoryId) {
    throw new Error('Type PORTION ou categoria Tradicional não encontrados');
  }
  let componentOrder = 100; // começa em 100 pra não conflitar com order dos produtos reais
  for (const name of COMPONENT_PRODUCTS_AS_PORTION) {
    // Se já existe como produto real (case-insensitive), reaproveita o id
    if (productIdByLowerName.has(name.toLowerCase())) {
      console.log(`   ⏭️  ${name} já existe como produto real (reaproveitando)`);
      continue;
    }
    const created = await prisma.product.create({
      data: {
        title: name,
        image: '',
        price: 0,
        order: componentOrder++,
        isActive: true,
        productTypeId: portionTypeId,
        categoryId: tradicionalCategoryId,
      },
    });
    productIdByLowerName.set(name.toLowerCase(), created.id);
    console.log(`   ✓ ${name} (id=${created.id})`);
  }

  // 7. Criar combos (16) com seus combo_products
  console.log('🍣 Criando combos...');
  const premiumCategoryId = categoryIdByName.get('Premium');
  if (!premiumCategoryId) {
    throw new Error('Categoria Premium não encontrada');
  }
  for (const combo of COMBOS) {
    const categoryId = categoryIdByName.get(combo.categoryName);
    if (!categoryId) {
      throw new Error(`Categoria não encontrada pra combo ${combo.name}`);
    }

    const created = await prisma.combo.create({
      data: {
        name: combo.name,
        image: combo.image,
        price: combo.price,
        order: combo.order,
        isActive: true,
        categoryId,
        products: {
          create: combo.products.map((p) => {
            const productId = productIdByLowerName.get(p.name.toLowerCase());
            if (!productId) {
              throw new Error(
                `Componente "${p.name}" não encontrado pra combo "${combo.name}"`,
              );
            }
            return {
              productId,
              quantity: p.quantity,
              order: p.order,
              isCustomizable: false,
            };
          }),
        },
      },
      include: { products: true },
    });
    console.log(
      `   ✓ ${combo.name} (id=${created.id}, ${created.products.length} produtos)`,
    );
  }

  // 8. Resumo final
  console.log();
  console.log('📊 Resumo:');
  console.log(`   Product types : ${await prisma.productType.count()}`);
  console.log(`   Categories    : ${await prisma.category.count()}`);
  console.log(`   Products      : ${await prisma.product.count()}`);
  console.log(`   Combos        : ${await prisma.combo.count()}`);
  console.log(`   Combo products: ${await prisma.comboProduct.count()}`);
  console.log(`   Ingredients   : ${await prisma.ingredient.count()} (deve ser 0)`);
  console.log();
  console.log('✅ Migração concluída com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
