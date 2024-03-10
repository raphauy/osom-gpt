-- CreateTable
CREATE TABLE "Summit" (
    "id" TEXT NOT NULL,
    "nombreReserva" TEXT DEFAULT '',
    "nombreCumpleanero" TEXT DEFAULT '',
    "fechaReserva" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT DEFAULT '',
    "resumenConversacion" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "Summit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Summit_conversationId_key" ON "Summit"("conversationId");

-- AddForeignKey
ALTER TABLE "Summit" ADD CONSTRAINT "Summit_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
