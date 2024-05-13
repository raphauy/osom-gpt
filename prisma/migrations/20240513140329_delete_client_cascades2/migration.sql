-- DropForeignKey
ALTER TABLE "ClientFunction" DROP CONSTRAINT "ClientFunction_clientId_fkey";

-- AddForeignKey
ALTER TABLE "ClientFunction" ADD CONSTRAINT "ClientFunction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
