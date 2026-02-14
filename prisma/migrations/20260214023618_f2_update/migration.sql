/*
  Warnings:

  - Added the required column `category` to the `Laundry_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Laundry_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Laundry_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemName` to the `Order_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Order_Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Order_Item` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OutletStatus" AS ENUM ('ACTIVE', 'CLOSED', 'RENOVATION');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('CUCI_SETRIKA', 'SATUAN', 'DRY_CLEAN');

-- CreateEnum
CREATE TYPE "ItemUnit" AS ENUM ('KG', 'PCS', 'M2');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "Station_Task" DROP CONSTRAINT "Station_Task_worker_id_fkey";

-- DropIndex
DROP INDEX "Staff_outlet_id_key";

-- AlterTable
ALTER TABLE "Laundry_Item" ADD COLUMN     "category" "ItemCategory" NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "unit" "ItemUnit" NOT NULL;

-- AlterTable
ALTER TABLE "Order_Item" ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Outlet" ADD COLUMN     "city" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "manager" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "openTime" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "OutletStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "lat" SET DEFAULT '0',
ALTER COLUMN "long" SET DEFAULT '0',
ALTER COLUMN "service_radius" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "shift_id" TEXT;

-- AlterTable
ALTER TABLE "Station_Task" ALTER COLUMN "worker_id" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station_Task" ADD CONSTRAINT "Station_Task_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
