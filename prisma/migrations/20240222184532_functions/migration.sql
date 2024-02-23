-- CreateTable
CREATE TABLE "Function" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Function_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFunction" (
    "clientId" TEXT NOT NULL,
    "functionId" TEXT NOT NULL,

    CONSTRAINT "ClientFunction_pkey" PRIMARY KEY ("clientId","functionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Function_name_key" ON "Function"("name");

-- AddForeignKey
ALTER TABLE "ClientFunction" ADD CONSTRAINT "ClientFunction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFunction" ADD CONSTRAINT "ClientFunction_functionId_fkey" FOREIGN KEY ("functionId") REFERENCES "Function"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
