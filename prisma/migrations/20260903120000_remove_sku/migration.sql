-- DropIndex
DROP INDEX "products_sku_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "sku";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "productSku";
