/**
 * Script: espelha dados de domínio do DEV → PRD.
 *
 * O QUE FAZ:
 *   1. Conecta em ambos os bancos (DEV via DATABASE_URL_DEV, PRD via DATABASE_URL_PRD).
 *   2. APAGA do PRD as tabelas de domínio (categories, combos, combo_products, combo_product_substitutions,
 *      products, product_types, menu_sections, ingredients, product_ingredients) — preservando `users`.
 *   3. Lê de DEV e insere em PRD na ordem correta de dependências.
 *   4. Reseta as sequences de autoincrement no PRD para que próximos inserts continuem do MAX(id)+1.
 *
 * NÃO TOCA EM:
 *   - users (login do admin PRD permanece intacto)
 *   - _prisma_migrations (controle de schema)
 *
 * COMO USAR:
 *   $env:DATABASE_URL_DEV  = "<url do banco DEV>"
 *   $env:DATABASE_URL_PRD  = "<url do banco PRD>"
 *   npx tsx scripts/mirror-dev-to-prd.ts
 *
 * DESTRUTIVO. Roda dentro de transação no PRD — falha total = rollback total.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function makeClient(label: string, url: string): PrismaClient {
  if (!url) {
    throw new Error(`Variável de ambiente ausente: ${label}`);
  }
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function main() {
  const devUrl = process.env.DATABASE_URL_DEV ?? '';
  const prdUrl = process.env.DATABASE_URL_PRD ?? '';

  const dev = makeClient('DATABASE_URL_DEV', devUrl);
  const prd = makeClient('DATABASE_URL_PRD', prdUrl);

  const devHost = devUrl.split('@')[1]?.split('/')[0] ?? '(desconhecido)';
  const prdHost = prdUrl.split('@')[1]?.split('/')[0] ?? '(desconhecido)';

  console.log('🪞 Espelhar dados de domínio DEV → PRD');
  console.log(`   ORIGEM (DEV) : ${devHost}`);
  console.log(`   DESTINO (PRD): ${prdHost}`);
  console.log();

  // ============================================================
  // 1. LER DE DEV
  // ============================================================
  console.log('📥 Lendo dados de DEV...');

  const productTypes = await dev.productType.findMany();
  const categories = await dev.category.findMany();
  const ingredients = await dev.ingredient.findMany();
  const products = await dev.product.findMany();
  const productIngredients = await dev.productIngredient.findMany();
  const combos = await dev.combo.findMany();
  const comboProducts = await dev.comboProduct.findMany();
  const comboProductSubstitutions =
    await dev.comboProductSubstitution.findMany();
  const menuSections = await dev.menuSection.findMany();

  console.log(`   ProductTypes              : ${productTypes.length}`);
  console.log(`   Categories                : ${categories.length}`);
  console.log(`   Ingredients               : ${ingredients.length}`);
  console.log(`   Products                  : ${products.length}`);
  console.log(`   ProductIngredients        : ${productIngredients.length}`);
  console.log(`   Combos                    : ${combos.length}`);
  console.log(`   ComboProducts             : ${comboProducts.length}`);
  console.log(
    `   ComboProductSubstitutions : ${comboProductSubstitutions.length}`,
  );
  console.log(`   MenuSections              : ${menuSections.length}`);
  console.log();

  // ============================================================
  // 2. ESCREVER EM PRD (dentro de transação)
  // ============================================================
  console.log('🗑️  Limpando dados de domínio do PRD (preservando users)...');

  // Ordem reversa de FKs para deletar
  await prd.$transaction(async (tx) => {
    await tx.menuSection.deleteMany({});
    await tx.comboProductSubstitution.deleteMany({});
    await tx.comboProduct.deleteMany({});
    await tx.combo.deleteMany({});
    await tx.productIngredient.deleteMany({});
    await tx.product.deleteMany({});
    await tx.ingredient.deleteMany({});
    await tx.category.deleteMany({});
    await tx.productType.deleteMany({});
  });
  console.log('   ✓ Tabelas de domínio limpas.');
  console.log();

  console.log('📤 Inserindo dados em PRD (ordem de dependências)...');

  await prd.$transaction(async (tx) => {
    if (productTypes.length)
      await tx.productType.createMany({ data: productTypes });
    if (categories.length) await tx.category.createMany({ data: categories });
    if (ingredients.length)
      await tx.ingredient.createMany({ data: ingredients });
    if (products.length) await tx.product.createMany({ data: products });
    if (productIngredients.length)
      await tx.productIngredient.createMany({ data: productIngredients });
    if (combos.length) await tx.combo.createMany({ data: combos });
    if (comboProducts.length)
      await tx.comboProduct.createMany({ data: comboProducts });
    if (comboProductSubstitutions.length)
      await tx.comboProductSubstitution.createMany({
        data: comboProductSubstitutions,
      });
    if (menuSections.length)
      await tx.menuSection.createMany({ data: menuSections });
  });
  console.log('   ✓ Dados inseridos.');
  console.log();

  // ============================================================
  // 3. RESET das sequences (autoincrement) no PRD
  // ============================================================
  console.log('🔢 Resetando sequences de autoincrement no PRD...');

  const tableSequences = [
    'product_types',
    'categories',
    'ingredients',
    'products',
    'product_ingredients',
    'combos',
    'combo_products',
    'combo_product_substitutions',
    'menu_sections',
  ];

  for (const table of tableSequences) {
    // setval para próximo id ser MAX(id)+1, ou 1 se tabela vazia
    await prd.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE((SELECT MAX(id) FROM "${table}"), 1),
        (SELECT MAX(id) IS NOT NULL FROM "${table}")
      )
    `);
    console.log(`   ✓ ${table}`);
  }
  console.log();

  console.log('✅ Espelhamento concluído.');
  console.log();
  console.log('📊 Verificação rápida (counts em PRD):');
  console.log(`   ProductTypes              : ${await prd.productType.count()}`);
  console.log(`   Categories                : ${await prd.category.count()}`);
  console.log(`   Ingredients               : ${await prd.ingredient.count()}`);
  console.log(`   Products                  : ${await prd.product.count()}`);
  console.log(
    `   ProductIngredients        : ${await prd.productIngredient.count()}`,
  );
  console.log(`   Combos                    : ${await prd.combo.count()}`);
  console.log(
    `   ComboProducts             : ${await prd.comboProduct.count()}`,
  );
  console.log(
    `   ComboProductSubstitutions : ${await prd.comboProductSubstitution.count()}`,
  );
  console.log(`   MenuSections              : ${await prd.menuSection.count()}`);
  console.log(`   Users (intocado)          : ${await prd.user.count()}`);

  await dev.$disconnect();
  await prd.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Falha:', err);
  process.exit(1);
});
