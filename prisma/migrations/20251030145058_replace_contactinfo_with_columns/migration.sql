/*
  Warnings:

  - You are about to drop the column `contactInfo` on the `Business` table. All the data in the column will be lost.
  - Added the required column `address` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "contactInfo",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;
