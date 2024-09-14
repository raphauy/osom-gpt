-- CreateEnum
CREATE TYPE "InboxProvider" AS ENUM ('OSOM', 'WRC');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "inboxProvider" "InboxProvider" NOT NULL DEFAULT 'OSOM';
