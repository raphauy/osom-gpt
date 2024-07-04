-- DropForeignKey
ALTER TABLE "RepoData" DROP CONSTRAINT "RepoData_repositoryId_fkey";

-- AddForeignKey
ALTER TABLE "RepoData" ADD CONSTRAINT "RepoData_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
