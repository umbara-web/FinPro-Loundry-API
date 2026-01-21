/*
  Warnings:

  - You are about to drop the column `is_email_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture_url` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_email_verified",
DROP COLUMN "profile_picture_url",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
