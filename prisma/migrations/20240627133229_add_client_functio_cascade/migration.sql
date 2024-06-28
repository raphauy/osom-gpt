-- DropForeignKey
ALTER TABLE "ClientFunction" DROP CONSTRAINT "ClientFunction_functionId_fkey";

-- AddForeignKey
ALTER TABLE "ClientFunction" ADD CONSTRAINT "ClientFunction_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "Function"("id") ON DELETE CASCADE ON UPDATE CASCADE;
