import { prisma } from "@/lib/db"
import { JsonValue } from "@prisma/client/runtime/library"
import * as z from "zod"
import { getClient, getClientBySlug } from "./clientService"
import { getFieldsDAOByRepositoryId } from "./field-services"
import { RepoSelectorData } from "@/app/client/[slug]/repo-data/repo-selector"
import { toZonedTime } from "date-fns-tz"

export type RepoDataDAO = {
	id: string
	repoName: string
  phone: string
	functionName: string
	data: string
	repositoryId: string | null
	clientId: string
  conversationId: string
	createdAt: Date
	updatedAt: Date
}

export const repoDataSchema = z.object({
	repoName: z.string().min(1, "repoName is required."),
  phone: z.string().min(1, "phone is required."),
	functionName: z.string().min(1, "functionName is required."),
	data: z.any(),
	repositoryId: z.string().min(1, "repositoryId is required."),
	clientId: z.string().min(1, "clientId is required."),
  conversationId: z.string().min(1, "conversationId is required."),
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
  const sortedData= await sortData(data.repositoryId, data.data)

  const repoData = {
    repoName: data.repoName,
    phone: data.phone,
    functionName: data.functionName,
    repositoryId: data.repositoryId,
    clientId: data.clientId,
    conversationId: data.conversationId,
    data: JSON.stringify(sortedData)
  };

  const created = await prisma.repoData.create({
    data: repoData,
    include: {
      client: {
        select: {
          name: true,
        }
      }
      
    }
  })
  return created;
}
export async function sortData(repositoryId: string, data: JsonValue): Promise<JsonValue> {
  if (!data) return {}
  const mappedDAta= JSON.parse(JSON.stringify(data))
  const sortedFields= await getFieldsDAOByRepositoryId(repositoryId)
  let res: JsonValue= {}
  for (const field of sortedFields) {
    const key= field.name
    res[field.name]= mappedDAta[key]
  }
  return res
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


export async function getFullRepoDatasDAO(slug: string, startStr?: string, endStr?: string, repoName?: string) {
  const client= await getClientBySlug(slug)
  if (!client) throw new Error("Client not found")
  const timezone= client.timezone

  const start= startStr ? toZonedTime(startStr, timezone) : undefined
  const end= endStr ? toZonedTime(endStr, timezone) : undefined

  console.log("start: ", start, "end: ", end, "repoName: ", repoName, "slug: ", slug)
  
  const found = await prisma.repoData.findMany({
    where: {
      clientId: client.id,
      createdAt: {
        gte: start,
        lte: end
      },
      repoName: repoName
    },
    orderBy: {
      updatedAt: "desc"
    },
    select: {
      id: true,
      conversationId: true,
      repoName: true,
      phone: true,
      functionName: true,
      createdAt: true,
      data: true,
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

export async function getRepoDataDAOByPhone(repositoryId: string, phone: string) {
  const found = await prisma.repoData.findFirst({
    where: {
      repositoryId,
      phone
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      phone: true,
      repoName: true,
      functionName: true,
      createdAt: true,
      data: true,
      client: {
        select: {
          name: true,
        }
      }
    }
  })
  return found
}

export async function getRepoNames(clientId: string): Promise<string[]> {
  const results = await prisma.$queryRaw`SELECT DISTINCT "repoName" FROM "RepoData" WHERE "clientId" = ${clientId}` as any[]

  const resp= results.map((repo: any) => repo.repoName)

  return resp
}
