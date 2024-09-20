import { format, formatDate, parse } from "date-fns";
import { getRepoDataDAOByPhone, RepoDataDAO } from "./repodata-services";
import { RepoDataEntryResponse } from "@/app/api/[clientId]/repo-data/[repoId]/route";
import { es } from "date-fns/locale";
import axios from "axios";
import * as z from "zod"
import { prisma } from "@/lib/db"
import { WebhookStatus } from "@prisma/client"
import { toZonedTime } from "date-fns-tz";
import { getRepositoryDAOByFunctionName } from "./repository-services";


type RepoDataWithClientName = RepoDataDAO & {
    client: {
        name: string
    }
}

export async function sendWebhookNotification(webhookUrl: string, repoData: RepoDataWithClientName, clientId: string) {

    let whResponse: string
    let status: WebhookStatus
    let duration: number
    let whError: string | undefined

    const data: RepoDataEntryResponse = {
        id: repoData.id,
        phone: repoData.phone,
        repoName: repoData.repoName,
        functionName: repoData.functionName,
        clientName: repoData.client.name,
        date: format(repoData.createdAt, "yyyy-MM-dd HH:mm", { locale: es }),
        data: repoData.data,
    }

    const init= new Date().getTime()
    const timeout= 10000 // 10 segundos
    try {
        const response = await axios.post(webhookUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: timeout, // 10 segundos
        })
        const elapsedTime = new Date().getTime() - init
        console.log(`Request took ${elapsedTime} milliseconds`)

        if (response.status !== 200) {
            console.error(`Failed to send webhook notification to ${webhookUrl} `, response.status, response.statusText)
            status = "error"
            whError = response.statusText
            whResponse = response.status.toString()
        } else {
            status = "success"
            whResponse = response.status.toString()
        }
        duration = elapsedTime
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error('Request timed out');
            whResponse = "Request timed out"
            whError = `Request timed out (${timeout/1000} s)`
        } else {
            console.error('Failed to send webhook notification:', error)
            whResponse = error instanceof Error ? error.message : String(error)
            whError = error instanceof Error ? error.message : String(error)
        }
        status = "error"
        duration = -1
    }

    try {
        const whnFormValues: WebhookNotificationFormValues = {
            phone: repoData.phone,
            webhookUrl: webhookUrl,
            clientName: repoData.client.name,
            functionName: repoData.functionName,
            data: repoData.data,
            clientId: clientId,
            status: status,
            response: whResponse,
            error: whError,
            duration: duration,
        }
    
        const created = await createWebhookNotification(whnFormValues)
        if (created) 
            console.log('Webhook notification created:', created)
        else 
            console.error('Failed to create webhook notification')

        return created

    } catch (error) {
        console.error('Failed to create webhook notification:', error)
        return null
    }
}

export async function resendWebhookNotification(id: string) {
    const found = await getWebhookNotificationDAO(id)
    if (!found) {
        throw new Error("Webhook notification not found")
    }

    const repository= await getRepositoryDAOByFunctionName(found.functionName)
    if (!repository) {
        throw new Error("Repository not found")
    }

    const repoData: RepoDataWithClientName | null = await getRepoDataDAOByPhone(repository.id, found.phone) as RepoDataWithClientName | null
    if (!repoData) {
        throw new Error("Repo data not found")
    }

    let createdId: string= "failed"
    let resendStatus: WebhookStatus= "success"
    try {
        const created= await sendWebhookNotification(found.webhookUrl, repoData, found.clientId)
        if (!created) {
            console.log("Failed to create resend webhook notification")
        } else {
            createdId= created.id
            resendStatus= created.status
        }
    
    } catch (error) {
        console.error("Failed to create resend webhook notification:", error)
    }

    // update status to resend and set resendId with created.id
    await updateResend(found.id, createdId, resendStatus)

}

export type WebhookNotificationDAO = {
	id: string
	phone: string
	webhookUrl: string
	clientName: string
	functionName: string
	data: string
	status: WebhookStatus
	timestamp: Date
	response: string
	error: string | undefined
    duration: number
	clientId: string
    resendId: string
    resendStatus: WebhookStatus | null
}

export const webhookNotificationSchema = z.object({
	phone: z.string().min(1, "phone is required."),
	webhookUrl: z.string().min(1, "webhookUrl is required."),
	clientName: z.string().min(1, "clientName is required."),
	functionName: z.string().min(1, "functionName is required."),
	data: z.string().min(1, "data is required."),
	status: z.nativeEnum(WebhookStatus),
	response: z.string().min(1, "response is required."),
	error: z.string().optional(),
	clientId: z.string().min(1, "clientId is required."),
	duration: z.number(),
})

export type WebhookNotificationFormValues = z.infer<typeof webhookNotificationSchema>


export async function getWebhookNotificationsDAO(start: string, end: string) {

    const format= "yyyy-MM-dd"
    const timezone= "America/Montevideo"

    let startDate: Date
    let endDate: Date
    try {
        startDate = parse(start, format, new Date())
        startDate.setHours(0, 0, 0, 0)
        endDate = parse(end, format, new Date())
        endDate.setHours(23, 59, 59, 999)
    } catch (error) {
        throw new Error("Invalid date format")        
    }

    console.log("startDate", startDate)
    console.log("endDate", endDate) 
 
    const found = await prisma.webhookNotification.findMany({
        orderBy: {
            timestamp: 'desc'
        },
        where: {
            timestamp: {
                gte: startDate,
                lte: endDate
            }
        }
    })
    return found as WebhookNotificationDAO[]
}


export async function getWebhookNotificationDAO(id: string) {
  const found = await prisma.webhookNotification.findUnique({
    where: {
      id
    },
  })
  return found as WebhookNotificationDAO
}
    
export async function createWebhookNotification(data: WebhookNotificationFormValues) {
  const created = await prisma.webhookNotification.create({
    data
  })
  return created
}

export async function updateWebhookNotification(id: string, data: WebhookNotificationFormValues) {
  const updated = await prisma.webhookNotification.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function updateResend(id: string, resendId: string, resendStatus: WebhookStatus) {
    const updated= await prisma.webhookNotification.update({
        where: {
            id: id
        },
        data: {
            status: "resend",
            resendId: resendId,
            resendStatus: resendStatus
        }
    })
    return updated
}

export async function deleteWebhookNotification(id: string) {
  const deleted = await prisma.webhookNotification.delete({
    where: {
      id
    },
  })
  return deleted
}

