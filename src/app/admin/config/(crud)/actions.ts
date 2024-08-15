"use server"

import { setMessageArrivedDelay, setTokensPrice } from "@/services/clientService"
import { revalidatePath } from "next/cache"


export async function setTokensPriceAction(clientId: string, promptTokensPrice: number, completionTokensPrice: number) {
    const client= await setTokensPrice(clientId, promptTokensPrice,completionTokensPrice)

    return client    
}

export async function setMessageArrivedDelayAction(clientId: string, messageArrivedDelay: number): Promise<boolean> {
    const client= await setMessageArrivedDelay(clientId, messageArrivedDelay)

    if (!client) return false

    revalidatePath("/admin/config")

    return true
}