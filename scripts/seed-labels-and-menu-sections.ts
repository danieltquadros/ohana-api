/**
 * Script de seed: popular `label` em ProductType/Category e
 * criar MenuSections iniciais.
 *
 * Idempotente — pode rodar várias vezes sem duplicar/quebrar.
 *
 * Uso:
 *   npx tsx scripts/seed-labels-and-menu-sections.ts
 */

import 'dotenv/config';
import { PrismaClient, MenuSectionKind } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { toSlug } from '../src/common/utils/slug.util';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// CONFIGURAÇÃO
// ============================================================

// Mapeamento dos ProductTypes existentes: name técnico → label exibido
const PRODUCT_TYPE_LABELS: Record<string, string> = {
  COMBO: 'Combos',
  TEMAKI: 'Temakis',
  MEGA_HOT: 'Mega Hots',
  POKES: 'Pokes',
  PORTION: 'Porções',
  YAKISOBA: 'Yakisobas',
};

// Mapeamento das Categories existentes: name atual → label desejado
// (o name vai ser regenerado via toSlug pra ficar no padrão UPPERCASE)
const CATEGORY_LABELS: Record<string, string> = {
  Premium: 'Premium',
  Tradicional: 'Tradicional',
};

// MenuSections iniciais — define a ordem do menu cliente
const MENU_SECTIONS: Array<{
  label: string;
  order: number;
  kind: MenuSectionKind;
  productTypeName?: string;
}> = [
  { label: 'Combos', order: 1, kind: MenuSectionKind.COMBOS },
  { label: 'Temakis', order: 2, kind: MenuSectionKind.PRODUCT_TYPE, productTypeName: 'TEMAKI' },
  { label: 'Mega Hots', order: 3, kind: MenuSectionKind.PRODUCT_TYPE, productTypeName: 'MEGA_HOT' },
  { label: 'Pokes', order: 4, kind: MenuSectionKind.PRODUCT_TYPE, productTypeName: 'POKES' },
  { label: 'Porções', order: 5, kind: MenuSectionKind.PRODUCT_TYPE, productTypeName: 'PORTION' },
  { label: 'Yakisobas', order: 6, kind: MenuSectionKind.PRODUCT_TYPE, productTypeName: 'YAKISOBA' },
];

// ============================================================
// SCRIPT PRINCIPAL
// ============================================================

async function main() {
  console.log('🍣 Seed de labels e MenuSections');
  console.log('Banco alvo:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? '(desconhecido)');
  console.log();

  // 1. Atualizar labels em ProductTypes existentes
  console.log('📂 Atualizando labels de ProductTypes...');
  for (const [name, label] of Object.entries(PRODUCT_TYPE_LABELS)) {
    const existing = await prisma.productType.findUnique({ where: { name } });
    if (!existing) {
      console.log(`   ⏭️  ${name} não existe no banco, pulando`);
      continue;
    }
    if (existing.label === label) {
      console.log(`   ✓ ${name} já tem label "${label}" (sem mudança)`);
      continue;
    }
    await prisma.productType.update({
      where: { name },
      data: { label },
    });
    console.log(`   ✓ ${name} → label "${label}"`);
  }

  // 2. Atualizar labels e regenerar names de Categories existentes
  console.log('🗂️  Atualizando labels/names de Categories...');
  for (const [oldName, label] of Object.entries(CATEGORY_LABELS)) {
    const newName = toSlug(label);
    const existing = await prisma.category.findUnique({ where: { name: oldName } });
    if (!existing) {
      console.log(`   ⏭️  ${oldName} não existe no banco, pulando`);
      continue;
    }
    if (existing.label === label && existing.name === newName) {
      console.log(`   ✓ ${oldName} já está no padrão novo (sem mudança)`);
      continue;
    }
    await prisma.category.update({
      where: { id: existing.id },
      data: { name: newName, label },
    });
    console.log(`   ✓ "${oldName}" → name="${newName}" label="${label}"`);
  }

  // 3. Criar MenuSections iniciais (idempotente)
  console.log('📋 Criando MenuSections...');
  for (const section of MENU_SECTIONS) {
    let productTypeId: number | undefined;

    if (section.kind === MenuSectionKind.PRODUCT_TYPE) {
      if (!section.productTypeName) {
        console.log(`   ⚠️  Section "${section.label}" sem productTypeName, pulando`);
        continue;
      }
      const pt = await prisma.productType.findUnique({
        where: { name: section.productTypeName },
      });
      if (!pt) {
        console.log(`   ⚠️  ProductType "${section.productTypeName}" não encontrado, pulando section "${section.label}"`);
        continue;
      }
      productTypeId = pt.id;

      // Verifica se já existe MenuSection pra esse productTypeId
      const existing = await prisma.menuSection.findUnique({
        where: { productTypeId: pt.id },
      });
      if (existing) {
        console.log(`   ✓ Section "${section.label}" já existe (productTypeId=${pt.id})`);
        continue;
      }
    } else if (section.kind === MenuSectionKind.COMBOS) {
      // Verifica se já existe MenuSection COMBOS
      const existing = await prisma.menuSection.findFirst({
        where: { kind: MenuSectionKind.COMBOS },
      });
      if (existing) {
        console.log(`   ✓ Section COMBOS já existe (label="${existing.label}")`);
        continue;
      }
    }

    const created = await prisma.menuSection.create({
      data: {
        label: section.label,
        order: section.order,
        kind: section.kind,
        isActive: true,
        productTypeId,
      },
    });
    console.log(`   ✓ Section criada: "${section.label}" (id=${created.id}, kind=${section.kind})`);
  }

  // 4. Resumo final
  console.log();
  console.log('📊 Resumo:');
  console.log(`   ProductTypes  : ${await prisma.productType.count()}`);
  console.log(`   Categories    : ${await prisma.category.count()}`);
  console.log(`   MenuSections  : ${await prisma.menuSection.count()}`);
  console.log();
  console.log('✅ Seed concluído com sucesso!');
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
