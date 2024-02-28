-- CreateTable
CREATE TABLE "Narvaez" (
    "id" TEXT NOT NULL,
    "idTrackeo" TEXT,
    "urlPropiedad" TEXT,
    "idPropiedad" TEXT,
    "resumenPedido" TEXT,
    "clasificacion" TEXT DEFAULT 'General',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conversationId" TEXT NOT NULL,

    CONSTRAINT "Narvaez_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Narvaez_idTrackeo_key" ON "Narvaez"("idTrackeo");

-- CreateIndex
CREATE UNIQUE INDEX "Narvaez_urlPropiedad_key" ON "Narvaez"("urlPropiedad");

-- CreateIndex
CREATE UNIQUE INDEX "Narvaez_idPropiedad_key" ON "Narvaez"("idPropiedad");

-- CreateIndex
CREATE UNIQUE INDEX "Narvaez_conversationId_key" ON "Narvaez"("conversationId");

-- AddForeignKey
ALTER TABLE "Narvaez" ADD CONSTRAINT "Narvaez_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
