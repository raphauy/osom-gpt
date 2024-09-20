-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('success', 'error');

-- CreateTable
CREATE TABLE "WebhookNotification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "status" "WebhookStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "response" TEXT NOT NULL,
    "error" TEXT,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "WebhookNotification_pkey" PRIMARY KEY ("id")
);
