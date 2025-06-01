import * as z from "zod"
import { prisma } from "@/lib/db"

export type PromptVersionDAO = {
	id: string
	content: string
	timestamp: Date
	user: string
  clientId: string
  type: string
}

export const promptVersionSchema = z.object({
	content: z.string().min(1, "content is required."),
	user: z.string().min(1, "user is required."),
  clientId: z.string().min(1, "clientId is required."),
  type: z.string().default("text"),
})

export type PromptVersionFormValues = z.infer<typeof promptVersionSchema>

// Tipos específicos para Image Prompts
export type ImagePromptVersionDAO = PromptVersionDAO & { type: "image" }
export type ImagePromptVersionFormValues = Omit<PromptVersionFormValues, 'type'> & { type: "image" }

export const imagePromptVersionSchema = z.object({
	content: z.string().min(1, "content is required."),
	user: z.string().min(1, "user is required."),
  clientId: z.string().min(1, "clientId is required."),
  type: z.literal("image"),
})

// Funciones para prompts de texto (mantienen compatibilidad)
export async function getPromptVersionsDAO(clientId: string) {
  const found = await prisma.promptVersion.findMany({
    where: {
      clientId,
      type: "text"
    },
    orderBy: {
      timestamp: 'desc'
    },
  })
  return found as PromptVersionDAO[]
}

// Nuevas funciones para prompts de imagen
export async function getImagePromptVersionsDAO(clientId: string) {
  const found = await prisma.promptVersion.findMany({
    where: {
      clientId,
      type: "image"
    },
    orderBy: {
      timestamp: 'desc'
    },
  })
  return found as ImagePromptVersionDAO[]
}

export async function getPromptVersionDAO(id: string) {
  const found = await prisma.promptVersion.findUnique({
    where: {
      id
    },
  })
  return found as PromptVersionDAO
}
    
export async function createPromptVersion(data: PromptVersionFormValues) {
  const created = await prisma.promptVersion.create({
    data: {
      ...data,
      type: data.type || "text"
    }
  })
  return created
}

export async function createImagePromptVersion(data: ImagePromptVersionFormValues) {
  const created = await prisma.promptVersion.create({
    data: {
      ...data,
      type: "image"
    }
  })
  return created
}

export async function updatePromptVersion(id: string, data: PromptVersionFormValues) {
  const updated = await prisma.promptVersion.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deletePromptVersion(id: string) {
  const deleted = await prisma.promptVersion.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function deleteImagePromptVersion(id: string) {
  const deleted = await prisma.promptVersion.delete({
    where: {
      id
    },
  })
  return deleted
}

