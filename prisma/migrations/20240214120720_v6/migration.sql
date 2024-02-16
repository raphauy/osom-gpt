-- CreateTable
CREATE TABLE "MessageSection" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "MessageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageSection_messageId_sectionId_key" ON "MessageSection"("messageId", "sectionId");
