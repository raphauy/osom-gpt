import { prisma } from "@/lib/db";

// Get all API services
export async function getApiServices() {
    return await prisma.apiService.findMany({
        orderBy: {
            serviceType: 'asc'
        }
    })
}

// Get API service by name
export async function getApiServiceByName(name: string) {
    return await prisma.apiService.findUnique({
        where: {
            name
        }
    })
}

// Get API service by service type (returns the most recent one)
export async function getApiServiceByType(serviceType: string) {
    return await prisma.apiService.findFirst({
        where: {
            serviceType
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
}

// Create or update API service
export async function upsertApiService(
    name: string,
    serviceType: string,
    promptTokensCost?: number,
    completionTokensCost?: number,
    secondsCost?: number
) {
    return await prisma.apiService.upsert({
        where: {
            name
        },
        update: {
            serviceType,
            promptTokensCost,
            completionTokensCost,
            secondsCost
        },
        create: {
            name,
            serviceType,
            promptTokensCost,
            completionTokensCost,
            secondsCost
        }
    })
}

// Delete API service
export async function deleteApiService(id: string) {
    return await prisma.apiService.delete({
        where: {
            id
        }
    })
} 