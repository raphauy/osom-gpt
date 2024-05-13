-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_documentId_fkey";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
