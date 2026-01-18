/*
  Warnings:

  - Added the required column `order` to the `product_types` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Adicionar coluna order com default temporário
ALTER TABLE "product_types" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Adicionar coluna inUse
ALTER TABLE "product_types" ADD COLUMN "inUse" BOOLEAN NOT NULL DEFAULT false;

-- Atualizar valores de order baseado nos nomes existentes
UPDATE "product_types" SET "order" = 1, "inUse" = true WHERE "name" = 'ALL';
UPDATE "product_types" SET "order" = 2, "inUse" = true WHERE "name" = 'COMBO';
UPDATE "product_types" SET "order" = 3, "inUse" = true WHERE "name" = 'PORTION';
UPDATE "product_types" SET "order" = 4, "inUse" = true WHERE "name" = 'POKES';
UPDATE "product_types" SET "order" = 5, "inUse" = true WHERE "name" = 'YAKISOBA';
UPDATE "product_types" SET "order" = 6, "inUse" = true WHERE "name" = 'MEGA_HOT';
UPDATE "product_types" SET "order" = 7, "inUse" = true WHERE "name" = 'TEMAKI';
UPDATE "product_types" SET "order" = 8, "inUse" = true WHERE "name" = 'ITEM';
UPDATE "product_types" SET "order" = 9, "inUse" = true WHERE "name" = 'DRINK';
UPDATE "product_types" SET "order" = 10, "inUse" = false WHERE "name" = 'OTHER';
UPDATE "product_types" SET "order" = 11, "inUse" = true WHERE "name" = 'URAMAKIS';
UPDATE "product_types" SET "order" = 12, "inUse" = true WHERE "name" = 'HOTS';
UPDATE "product_types" SET "order" = 13, "inUse" = true WHERE "name" = 'HOSSOS';

-- Remover o default temporário (agora todos os registros têm valores)
ALTER TABLE "product_types" ALTER COLUMN "order" DROP DEFAULT;

