-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'array';

-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "items" TEXT;
