"use server"

import { revalidatePath } from "next/cache"
import { 
    getApiServices, 
    getApiServiceByName, 
    upsertApiService, 
    deleteApiService 
} from "@/services/apiServiceService"

export type ApiService = {
    id: string
    name: string
    serviceType: string
    promptTokensCost: number | null
    completionTokensCost: number | null
    secondsCost: number | null
    createdAt: Date
    updatedAt: Date
}

export async function getApiServicesAction(): Promise<ApiService[]> {
    return await getApiServices()
}

export async function upsertApiServiceAction(
    name: string,
    serviceType: string,
    promptTokensCost?: number,
    completionTokensCost?: number,
    secondsCost?: number
) {
    const result = await upsertApiService(name, serviceType, promptTokensCost, completionTokensCost, secondsCost)
    revalidatePath("/admin/api-services")
    return result
}

export async function deleteApiServiceAction(id: string) {
    const result = await deleteApiService(id)
    revalidatePath("/admin/api-services")
    return result
} 