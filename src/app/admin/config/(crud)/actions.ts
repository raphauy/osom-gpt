"use server"

import { setMessageArrivedDelay, setSessionTTL, setTimezone, setTokensPrice } from "@/services/clientService"
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

export async function setSessionTTLAction(clientId: string, sessionTTL: number): Promise<boolean> {
    const client= await setSessionTTL(clientId, sessionTTL)

    if (!client) return false

    revalidatePath("/admin/config")

    return true
}

export async function setTimezoneAction(clientId: string, timezone: string): Promise<boolean> {
    const client= await setTimezone(clientId, timezone)

    if (!client) return false

    revalidatePath("/admin/config")

    return true
}