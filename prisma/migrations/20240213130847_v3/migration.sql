/*
  Warnings:

  - Made the column `clientId` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "fileSize" DROP NOT NULL,
ALTER COLUMN "clientId" SET NOT NULL;
