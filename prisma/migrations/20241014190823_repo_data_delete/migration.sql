-- DropForeignKey
ALTER TABLE "RepoData" DROP CONSTRAINT "RepoData_clientId_fkey";

-- AddForeignKey
ALTER TABLE "RepoData" ADD CONSTRAINT "RepoData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
