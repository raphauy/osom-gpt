import { prisma } from "@/lib/db";
import { getApiServiceByType, upsertApiService } from "./apiServiceService";

// Types
export type ApiUsageData = {
    clientName: string
    serviceType: string
    totalUsage: number      // tokens totales o segundos totales
    promptTokens?: number   // solo para imagen y embedding
    completionTokens?: number // solo para imagen
    durationSeconds?: number  // solo para audio
    usageTokens?: number     // solo para embedding
    unitPrice: number       // precio por unidad (token o segundo) - precio de venta
    unitCost: number        // costo por unidad (token o segundo) - costo de OpenAI
    totalCost: number       // costo total calculado (precio de venta)
    totalOpenAICost: number // costo total real de OpenAI
}

export type ApiUsageBillingData = {
    totalCost: number
    usageData: ApiUsageData[]
}

// Record usage for image API
export async function recordImageUsage(
    clientId: string, 
    promptTokens: number, 
    completionTokens: number, 
    totalTokens: number,
    serviceName?: string
) {
    console.log(`Recording image usage for client ${clientId}: prompt=${promptTokens}, completion=${completionTokens}, total=${totalTokens}`)
    
    // Get or create API service
    let apiService = null
    if (serviceName) {
        apiService = await getApiServiceByType("image")
        if (!apiService) {
            // Create a basic service with 0 costs - admin will configure later
            apiService = await upsertApiService(serviceName, "image", 0, 0, 0)
        }
    }
    
    return await prisma.apiUsage.create({
        data: {
            clientId,
            serviceType: "image",
            promptTokens,
            completionTokens,
            totalTokens,
            apiServiceId: apiService?.id
        }
    })
}

// Record usage for audio API
export async function recordAudioUsage(
    clientId: string, 
    durationSeconds: number,
    serviceName?: string
) {
    console.log(`Recording audio usage for client ${clientId}: duration=${durationSeconds} seconds`)
    
    // Get or create API service
    let apiService = null
    if (serviceName) {
        apiService = await getApiServiceByType("audio")
        if (!apiService) {
            // Create a basic service with 0 costs - admin will configure later
            apiService = await upsertApiService(serviceName, "audio", 0, 0, 0)
        }
    }
    
    return await prisma.apiUsage.create({
        data: {
            clientId,
            serviceType: "audio",
            durationSeconds,
            apiServiceId: apiService?.id
        }
    })
}

// Record usage for embedding API
export async function recordEmbeddingUsage(
    clientId: string, 
    usageTokens: number,
    serviceName?: string
) {
    console.log(`Recording embedding usage for client ${clientId}: tokens=${usageTokens}`)
    
    // Get or create API service
    let apiService = null
    if (serviceName) {
        apiService = await getApiServiceByType("embedding")
        if (!apiService) {
            // Create a basic service with 0 costs - admin will configure later
            apiService = await upsertApiService(serviceName, "embedding", 0, 0, 0)
        }
    }
    
    return await prisma.apiUsage.create({
        data: {
            clientId,
            serviceType: "embedding",
            usageTokens,
            apiServiceId: apiService?.id
        }
    })
}

// Get API usage billing data for a date range
export async function getApiUsageBillingData(
    from: Date, 
    to: Date, 
    clientId?: string
): Promise<ApiUsageBillingData> {
    
    const where = clientId ? { clientId } : {}
    
    // First, update any existing usage records that don't have apiServiceId
    await updateExistingUsageWithServices(where)
    
    const apiUsages = await prisma.apiUsage.findMany({
        where: {
            ...where,
            createdAt: {
                gte: from,
                lte: to
            }
        },
        include: {
            client: {
                select: {
                    name: true,
                    imagePromptTokensPrice: true,
                    imageCompletionTokensPrice: true,
                    audioSecondsPrice: true,
                    embeddingTokensPrice: true
                }
            },
            apiService: {
                select: {
                    name: true,
                    serviceType: true,
                    promptTokensCost: true,
                    completionTokensCost: true,
                    secondsCost: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    console.log("API usages count: ", apiUsages.length)
    
    // Debug: log each usage record
    apiUsages.forEach((usage, index) => {
        console.log(`Usage ${index}:`, {
            serviceType: usage.serviceType,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
            clientPrices: {
                imagePromptTokensPrice: usage.client.imagePromptTokensPrice,
                imageCompletionTokensPrice: usage.client.imageCompletionTokensPrice
            },
            apiService: usage.apiService ? {
                name: usage.apiService.name,
                promptTokensCost: usage.apiService.promptTokensCost,
                completionTokensCost: usage.apiService.completionTokensCost
            } : null
        })
    })

    // Group by client and service type
    const clientServiceMap: {[key: string]: ApiUsageData} = {}

    for (const usage of apiUsages) {
        const clientName = usage.client.name
        const serviceType = usage.serviceType
        const key = `${clientName}-${serviceType}`

        let totalUsage = 0
        let unitPrice = 0
        let unitCost = 0
        let promptTokens = 0
        let completionTokens = 0
        let durationSeconds = 0
        let usageTokens = 0

        // Calculate usage, price and cost based on service type
        switch (serviceType) {
            case "image":
                promptTokens = usage.promptTokens || 0
                completionTokens = usage.completionTokens || 0
                totalUsage = usage.totalTokens || 0
                // For image, we calculate price and cost separately for prompt and completion tokens
                const promptPrice = (promptTokens / 1000000) * usage.client.imagePromptTokensPrice
                const completionPrice = (completionTokens / 1000000) * usage.client.imageCompletionTokensPrice
                unitPrice = totalUsage > 0 ? (promptPrice + completionPrice) / (totalUsage / 1000000) : 0
                
                // Calculate OpenAI costs if apiService is available, otherwise try to get default service
                let promptOpenAICost = 0
                let completionOpenAICost = 0
                
                if (usage.apiService) {
                    promptOpenAICost = (promptTokens / 1000000) * (usage.apiService.promptTokensCost || 0)
                    completionOpenAICost = (completionTokens / 1000000) * (usage.apiService.completionTokensCost || 0)
                } else {
                    // No apiService associated, try to get default service for type
                    console.log("No apiService found for usage, trying to get default service for type:", serviceType)
                    // For now, set to 0 - this will be improved
                }
                
                unitCost = totalUsage > 0 ? (promptOpenAICost + completionOpenAICost) / (totalUsage / 1000000) : 0
                break
                
            case "audio":
                totalUsage = usage.durationSeconds || 0
                durationSeconds = totalUsage
                unitPrice = usage.client.audioSecondsPrice
                unitCost = usage.apiService ? (usage.apiService.secondsCost || 0) : 0
                break
                
            case "embedding":
                totalUsage = usage.usageTokens || 0
                usageTokens = totalUsage
                unitPrice = usage.client.embeddingTokensPrice
                unitCost = usage.apiService ? (usage.apiService.promptTokensCost || 0) : 0
                break
        }

        if (!clientServiceMap[key]) {
            clientServiceMap[key] = {
                clientName,
                serviceType,
                totalUsage,
                promptTokens: serviceType === "image" ? promptTokens : undefined,
                completionTokens: serviceType === "image" ? completionTokens : undefined,
                durationSeconds: serviceType === "audio" ? durationSeconds : undefined,
                usageTokens: serviceType === "embedding" ? usageTokens : undefined,
                unitPrice,
                unitCost,
                totalCost: 0, // calculated below
                totalOpenAICost: 0 // calculated below
            }
        } else {
            // Accumulate usage
            clientServiceMap[key].totalUsage += totalUsage
            if (serviceType === "image") {
                clientServiceMap[key].promptTokens = (clientServiceMap[key].promptTokens || 0) + promptTokens
                clientServiceMap[key].completionTokens = (clientServiceMap[key].completionTokens || 0) + completionTokens
            } else if (serviceType === "audio") {
                clientServiceMap[key].durationSeconds = (clientServiceMap[key].durationSeconds || 0) + durationSeconds
            } else if (serviceType === "embedding") {
                clientServiceMap[key].usageTokens = (clientServiceMap[key].usageTokens || 0) + usageTokens
            }
        }
    }

    // Calculate total costs
    let totalCost = 0
    const usageData: ApiUsageData[] = []

    for (const key in clientServiceMap) {
        const data = clientServiceMap[key]
        
        console.log(`Calculating costs for ${key}:`, {
            serviceType: data.serviceType,
            totalUsage: data.totalUsage,
            unitPrice: data.unitPrice,
            unitCost: data.unitCost,
            promptTokens: data.promptTokens,
            completionTokens: data.completionTokens
        })
        
        // Calculate total cost (price) and total OpenAI cost based on service type
        switch (data.serviceType) {
            case "image":
                // Calculate directly using totalUsage and average rates
                data.totalCost = (data.totalUsage / 1000000) * data.unitPrice
                data.totalOpenAICost = (data.totalUsage / 1000000) * data.unitCost
                break
                
            case "audio":
                data.totalCost = (data.durationSeconds || 0) * data.unitPrice
                data.totalOpenAICost = (data.durationSeconds || 0) * data.unitCost
                break
                
            case "embedding":
                data.totalCost = ((data.usageTokens || 0) / 1000000) * data.unitPrice
                data.totalOpenAICost = ((data.usageTokens || 0) / 1000000) * data.unitCost
                break
        }

        console.log(`Final costs for ${key}:`, {
            totalCost: data.totalCost,
            totalOpenAICost: data.totalOpenAICost
        })

        totalCost += data.totalCost
        usageData.push(data)
    }

    // Sort by total cost descending
    usageData.sort((a, b) => b.totalCost - a.totalCost)

    return {
        totalCost,
        usageData
    }
}

// Helper function to update existing usage records with apiServiceId
async function updateExistingUsageWithServices(where: any) {
    try {
        // Get all usage records without apiServiceId
        const usagesWithoutService = await prisma.apiUsage.findMany({
            where: {
                ...where,
                apiServiceId: null
            }
        })

        console.log(`Found ${usagesWithoutService.length} usage records without apiServiceId`)

        for (const usage of usagesWithoutService) {
            const service = await getApiServiceByType(usage.serviceType)
            if (service) {
                await prisma.apiUsage.update({
                    where: { id: usage.id },
                    data: { apiServiceId: service.id }
                })
                console.log(`Updated usage ${usage.id} with service ${service.name}`)
            }
        }
    } catch (error) {
        console.error("Error updating existing usage records:", error)
    }
}

// Get API usage count for a specific client and service
export async function getApiUsageCount(clientId: string, serviceType?: string) {
    const where = serviceType ? { clientId, serviceType } : { clientId }
    
    return await prisma.apiUsage.count({
        where
    })
} 