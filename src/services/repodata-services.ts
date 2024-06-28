import { prisma } from "@/lib/db"
import { JsonValue } from "@prisma/client/runtime/library"
import * as z from "zod"
import { getClient, getClientBySlug } from "./clientService"

export type RepoDataDAO = {
	id: string
	repoName: string
	functionName: string
	data: JsonValue
	repositoryId: string
	clientId: string
	createdAt: Date
	updatedAt: Date
}

export const repoDataSchema = z.object({
	repoName: z.string().min(1, "repoName is required."),
	functionName: z.string().min(1, "functionName is required."),
	data: z.any(),
	repositoryId: z.string().min(1, "repositoryId is required."),
	clientId: z.string().min(1, "clientId is required."),
})

export type repoDataFormValues = z.infer<typeof repoDataSchema>


export async function getRepoDatasDAO() {
  const found = await prisma.repoData.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as RepoDataDAO[]
}

export async function getRepoDataDAO(id: string) {
  const found = await prisma.repoData.findUnique({
    where: {
      id
    },
  })
  return found as RepoDataDAO
}
    
export async function createRepoData(data: repoDataFormValues) {
  const repoData = {
    repoName: data.repoName,
    functionName: data.functionName,
    repositoryId: data.repositoryId,
    clientId: data.clientId,
    data: data.data ?? {}
  };

  const created = await prisma.repoData.create({
    data: repoData
  });
  return created;
}

export async function updateRepoData(id: string, data: repoDataFormValues) {
  const updated = await prisma.repoData.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteRepoData(id: string) {
  const deleted = await prisma.repoData.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullRepoDatasDAO(slug: string) {
  const client= await getClientBySlug(slug)
  if (!client)
    throw new Error("Client not found")
  
  const found = await prisma.repoData.findMany({
    where: {
      clientId: client.id
    },
    orderBy: {
      updatedAt: "desc"
    },
    include: {
			repository: true,
			client: true,
		}
  })
  return found as RepoDataDAO[]
}
  
export async function getFullRepoDataDAO(id: string) {
  const found = await prisma.repoData.findUnique({
    where: {
      id
    },
    include: {
			repository: true,
			client: true,
		}
  })
  return found as RepoDataDAO
}
    