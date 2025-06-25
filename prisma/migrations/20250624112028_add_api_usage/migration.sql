-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "audioSecondsPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "embeddingTokensPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imageCompletionTokensPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "imagePromptTokensPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "promptTokens" INTEGER DEFAULT 0,
    "completionTokens" INTEGER DEFAULT 0,
    "totalTokens" INTEGER DEFAULT 0,
    "durationSeconds" DOUBLE PRECISION DEFAULT 0,
    "usageTokens" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
