/*
  Warnings:

  - You are about to drop the column `svgContent` on the `Repository` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "svgContent",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'rgb(68, 190, 154)';
