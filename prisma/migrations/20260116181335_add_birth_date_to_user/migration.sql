/*
  Warnings:

  - Added the required column `city` to the `Customer_Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postal_code` to the `Customer_Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_name` to the `Customer_Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_phone` to the `Customer_Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer_Address" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "postal_code" TEXT NOT NULL,
ADD COLUMN     "recipient_name" TEXT NOT NULL,
ADD COLUMN     "recipient_phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3);
