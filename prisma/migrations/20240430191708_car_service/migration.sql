-- CreateTable
CREATE TABLE "CarService" (
    "id" TEXT NOT NULL,
    "nombreReserva" TEXT NOT NULL DEFAULT '',
    "telefonoContacto" TEXT NOT NULL DEFAULT '',
    "fechaReserva" TEXT NOT NULL DEFAULT '',
    "localReserva" TEXT NOT NULL DEFAULT '',
    "marcaAuto" TEXT NOT NULL DEFAULT '',
    "modeloAuto" TEXT NOT NULL DEFAULT '',
    "matriculaAuto" TEXT NOT NULL DEFAULT '',
    "kilometraje" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "CarService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CarService_conversationId_key" ON "CarService"("conversationId");

-- AddForeignKey
ALTER TABLE "CarService" ADD CONSTRAINT "CarService_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
