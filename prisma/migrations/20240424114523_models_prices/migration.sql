/*
  Warnings:

  - You are about to drop the column `price` on the `Model` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Model" DROP COLUMN "price",
ADD COLUMN     "inputPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "outputPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
