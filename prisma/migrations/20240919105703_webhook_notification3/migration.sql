/*
  Warnings:

  - Added the required column `duration` to the `WebhookNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebhookNotification" ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL;
