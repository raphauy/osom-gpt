-- AlterEnum
ALTER TYPE "WebhookStatus" ADD VALUE 'resend';

-- AlterTable
ALTER TABLE "WebhookNotification" ADD COLUMN     "resendId" TEXT;
