-- ===================================================================
-- Migration: product_type_label_and_menu_section
-- ===================================================================
-- 1. Adiciona `label` em product_types e categories (display name)
-- 2. Em product_types: remove `order` (movido pra MenuSection) e
--    substitui `inUse` (zombie) por `isActive` (padrão consistente)
-- 3. Cria nova tabela `menu_sections` que controla o menu dinâmico

-- -------------------------------------------------------------------
-- 1. product_types: label, isActive, remover order/inUse
-- -------------------------------------------------------------------

-- Adiciona label com DEFAULT temporário (preencher depois via script)
ALTER TABLE "product_types" ADD COLUMN "label" TEXT NOT NULL DEFAULT '';

-- Popula label inicial usando o name (vai ser sobrescrito por script de migração)
UPDATE "product_types" SET "label" = "name";

-- Remove o DEFAULT (label sempre tem que ser informado explicitamente)
ALTER TABLE "product_types" ALTER COLUMN "label" DROP DEFAULT;

-- Adiciona isActive (vem como TRUE pra todos os existentes)
ALTER TABLE "product_types" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Remove order (deixará de existir em product_types — vai pra menu_sections)
ALTER TABLE "product_types" DROP COLUMN "order";

-- Remove inUse (zombie code — substituído por isActive)
ALTER TABLE "product_types" DROP COLUMN "inUse";

-- -------------------------------------------------------------------
-- 2. categories: label
-- -------------------------------------------------------------------

ALTER TABLE "categories" ADD COLUMN "label" TEXT NOT NULL DEFAULT '';
UPDATE "categories" SET "label" = "name";
ALTER TABLE "categories" ALTER COLUMN "label" DROP DEFAULT;

-- -------------------------------------------------------------------
-- 3. menu_sections: nova tabela
-- -------------------------------------------------------------------

CREATE TYPE "MenuSectionKind" AS ENUM ('PRODUCT_TYPE', 'COMBOS');

CREATE TABLE "menu_sections" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kind" "MenuSectionKind" NOT NULL,
    "productTypeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "menu_sections_pkey" PRIMARY KEY ("id")
);

-- productTypeId é único: cada productType só pode ter uma menu_section
CREATE UNIQUE INDEX "menu_sections_productTypeId_key" ON "menu_sections"("productTypeId");

-- FK pra product_types com Restrict (não deixa apagar productType usado em menu_section)
ALTER TABLE "menu_sections" ADD CONSTRAINT "menu_sections_productTypeId_fkey"
    FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
