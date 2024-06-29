import { format } from "date-fns";
import { RepoDataDAO } from "./repodata-services";
import { RepoDataEntryResponse } from "@/app/api/[clientId]/repo-data/[repoId]/route";
import { es } from "date-fns/locale";
import axios from "axios";


type RepoDataWithClientName = RepoDataDAO & {
    client: {
        name: string
    }
}

export async function sendWebhookNotification(webhookUrl: string, repoData: RepoDataWithClientName) {

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
    try {
        const response = await axios.post(webhookUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos
        })
        const elapsedTime = new Date().getTime() - init
        console.log(`Request took ${elapsedTime} milliseconds`)

        if (response.status !== 200) {
            console.error('Failed to send webhook notification:', response.status, response.statusText)
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        } else {
            console.error('Failed to send webhook notification:', error)
        }
    }
}