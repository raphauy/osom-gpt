"use server"

import { getClientName, getClientsMinimal } from "@/services/clientService"

export type ClientMinimal= {
    id: string
    name: string
}
export async function getClientsMinimalAction(): Promise<ClientMinimal[]> {
    const clients= await getClientsMinimal()
    return clients
}

export async function getClientNameAction(clientId: string ): Promise<string | null> {
    return await getClientName(clientId)
}