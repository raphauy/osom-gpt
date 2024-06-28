/*
  Warnings:

  - Added the required column `conversationId` to the `RepoData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `RepoData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RepoData" ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "RepoData" ADD CONSTRAINT "RepoData_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
