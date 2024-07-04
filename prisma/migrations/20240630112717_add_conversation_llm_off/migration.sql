-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "llmOff" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "conversationLLMOff" BOOLEAN NOT NULL DEFAULT false;
