-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "OfferScope" AS ENUM ('PRODUCT', 'COMBO', 'CATEGORY', 'PRODUCT_TYPE', 'CART_TOTAL');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

-- CreateTable
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "kind" "OfferKind" NOT NULL,
    "scope" "OfferScope" NOT NULL,
    "percentage" DECIMAL(5,2),
    "fixedAmount" DECIMAL(10,2),
    "minOrderValue" DECIMAL(10,2),
    "maxDiscountValue" DECIMAL(10,2),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "daysOfWeek" "DayOfWeek"[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_products" (
    "offerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "offer_products_pkey" PRIMARY KEY ("offerId","productId")
);

-- CreateTable
CREATE TABLE "offer_combos" (
    "offerId" INTEGER NOT NULL,
    "comboId" INTEGER NOT NULL,

    CONSTRAINT "offer_combos_pkey" PRIMARY KEY ("offerId","comboId")
);

-- CreateTable
CREATE TABLE "offer_categories" (
    "offerId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "offer_categories_pkey" PRIMARY KEY ("offerId","categoryId")
);

-- CreateTable
CREATE TABLE "offer_product_types" (
    "offerId" INTEGER NOT NULL,
    "productTypeId" INTEGER NOT NULL,

    CONSTRAINT "offer_product_types_pkey" PRIMARY KEY ("offerId","productTypeId")
);

-- CreateIndex
CREATE INDEX "offers_isActive_idx" ON "offers"("isActive");

-- CreateIndex
CREATE INDEX "offers_validFrom_validUntil_idx" ON "offers"("validFrom", "validUntil");

-- AddForeignKey
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_products" ADD CONSTRAINT "offer_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_combos" ADD CONSTRAINT "offer_combos_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_combos" ADD CONSTRAINT "offer_combos_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "combos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_categories" ADD CONSTRAINT "offer_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_product_types" ADD CONSTRAINT "offer_product_types_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_product_types" ADD CONSTRAINT "offer_product_types_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
