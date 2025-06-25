-- AlterTable
ALTER TABLE "ApiUsage" ADD COLUMN     "apiServiceId" TEXT;

-- CreateTable
CREATE TABLE "ApiService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "promptTokensCost" DOUBLE PRECISION DEFAULT 0,
    "completionTokensCost" DOUBLE PRECISION DEFAULT 0,
    "secondsCost" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiService_name_key" ON "ApiService"("name");

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_apiServiceId_fkey" FOREIGN KEY ("apiServiceId") REFERENCES "ApiService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
