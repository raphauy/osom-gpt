/*
  Warnings:

  - You are about to drop the column `charCount` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "charCount",
ADD COLUMN     "wordsCount" INTEGER DEFAULT 0;
