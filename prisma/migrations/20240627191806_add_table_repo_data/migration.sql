-- CreateTable
CREATE TABLE "RepoData" (
    "id" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepoData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RepoData" ADD CONSTRAINT "RepoData_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoData" ADD CONSTRAINT "RepoData_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
