/*
  Warnings:

  - Added the required column `functionId` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "functionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "Function"("id") ON DELETE CASCADE ON UPDATE CASCADE;
