import 'dotenv/config';
import { PrismaClient, CategoryType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as path from 'path';
import * as fs from 'fs';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Importar dados do frontend
const frontendPath = path.join(
  __dirname,
  '../../ohana_sushi/components/Showcase',
);

// Ler e importar os arquivos TypeScript do frontend
function loadFrontendData(filename: string): any[] {
  const filePath = path.join(frontendPath, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Arquivo não encontrado: ${filename}`);
    return [];
  }

  try {
    // Ler o arquivo e extrair o array de dados
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/export const \w+: \w+\[\] = (\[[\s\S]*\]);/);

    if (match) {
      // Usar eval com cuidado - apenas para seed local
      const data = eval(match[1]);
      return data;
    }
  } catch (error) {
    console.error(`❌ Erro ao ler ${filename}:`, error);
  }

  return [];
}

async function main() {
  console.log('🌱 Iniciando seed com dados do frontend...\n');

  // Carregar dados do frontend
  console.log('📂 Carregando dados do frontend...');
  const combos = loadFrontendData('comboList.ts');
  const temakis = loadFrontendData('temakiList.ts');
  const hots = loadFrontendData('megaHotList.ts');
  const pokes = loadFrontendData('pokesList.ts');
  const portions = loadFrontendData('portionList.ts');
  const yakisobas = loadFrontendData('yakisobaList.ts');
  const products = loadFrontendData('productList.ts');

  const allProducts = [
    ...combos,
    ...temakis,
    ...hots,
    ...pokes,
    ...portions,
    ...yakisobas,
    ...products,
  ];

  console.log(`   ✓ ${allProducts.length} produtos carregados do frontend`);

  // Limpar banco
  console.log('\n🗑️  Limpando banco de dados...');
  await prisma.productIngredient.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.category.deleteMany();
  await prisma.productType.deleteMany();
  console.log('   ✓ Banco limpo!');

  // 1. Criar ProductTypes únicos
  console.log('\n📦 Criando tipos de produto...');
  const uniqueTypes = [...new Set(allProducts.map((p) => p.type))];
  const typeMap: Record<string, number> = {};

  for (let i = 0; i < uniqueTypes.length; i++) {
    const type = await prisma.productType.create({
      data: {
        name: uniqueTypes[i],
        order: i + 1,
        inUse: true,
      },
    });
    typeMap[uniqueTypes[i]] = type.id;
  }
  console.log(`   ✓ ${uniqueTypes.length} tipos criados`);

  // 2. Criar Categories
  console.log('\n🏷️  Criando categorias...');
  const catPremium = await prisma.category.create({
    data: {
      name: 'Premium',
      description: 'Produtos especiais',
      type: CategoryType.PRODUCT,
      order: 1,
      isActive: true,
    },
  });

  const catTradicional = await prisma.category.create({
    data: {
      name: 'Tradicional',
      description: 'Clássicos',
      type: CategoryType.PRODUCT,
      order: 2,
      isActive: true,
    },
  });
  console.log('   ✓ 2 categorias criadas');

  // 3. Extrair e criar Ingredients ÚNICOS (master table)
  console.log('\n🍣 Extraindo ingredientes únicos...');
  const allIngredientNames = new Set<string>();

  allProducts.forEach((product) => {
    if (product.ingredientList && Array.isArray(product.ingredientList)) {
      product.ingredientList.forEach((ing: any) => {
        allIngredientNames.add(ing.name.toLowerCase().trim());
      });
    }
  });

  const ingredientMap: Record<string, number> = {};

  for (const ingredientName of Array.from(allIngredientNames).sort()) {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1),
        isAllergenic: false, // Pode ser ajustado depois manualmente
      },
    });
    ingredientMap[ingredientName] = ingredient.id;
  }

  console.log(`   ✓ ${allIngredientNames.size} ingredientes únicos criados`);

  // 4. Criar Products com ingredientes (many-to-many)
  console.log('\n🍱 Criando produtos...');
  let createdCount = 0;

  for (const productData of allProducts) {
    // Determinar categoria (exemplo: combos são premium)
    const categoryId =
      productData.type === 'COMBO' ? catPremium.id : catTradicional.id;

    // Criar produto
    const product = await prisma.product.create({
      data: {
        title: productData.title,
        image: productData.image,
        price: productData.price,
        order: productData.order,
        productTypeId: typeMap[productData.type],
        categoryId: categoryId,
        isActive: true,
      },
    });

    // Criar relações de ingredientes (many-to-many)
    if (
      productData.ingredientList &&
      Array.isArray(productData.ingredientList)
    ) {
      for (let i = 0; i < productData.ingredientList.length; i++) {
        const ing = productData.ingredientList[i];
        const ingredientKey = ing.name.toLowerCase().trim();

        await prisma.productIngredient.create({
          data: {
            productId: product.id,
            ingredientId: ingredientMap[ingredientKey],
            quantity: ing.quantity,
            order: i + 1,
          },
        });
      }
    }

    createdCount++;
    if (createdCount % 10 === 0) {
      console.log(`   ... ${createdCount}/${allProducts.length}`);
    }
  }

  console.log(
    `   ✓ ${createdCount} produtos criados com ingredientes vinculados!`,
  );

  console.log('\n✅ Seed concluído com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${uniqueTypes.length} tipos de produto`);
  console.log(`   - 2 categorias`);
  console.log(`   - ${allIngredientNames.size} ingredientes únicos`);
  console.log(`   - ${createdCount} produtos`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
