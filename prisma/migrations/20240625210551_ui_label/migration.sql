/*
  Warnings:

  - Added the required column `uiLabel` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "uiLabel" TEXT NOT NULL;
