/*
  Warnings:

  - You are about to drop the column `budgetPercMax` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `budgetPercMin` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "budgetPercMax",
DROP COLUMN "budgetPercMin";
