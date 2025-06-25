"use server"

import { getApiUsageBillingData, ApiUsageBillingData } from "@/services/apiUsageService"

export type { ApiUsageData, ApiUsageBillingData } from "@/services/apiUsageService"

export async function getApiUsageBillingDataAction(
    from: Date, 
    to: Date, 
    clientId?: string
): Promise<ApiUsageBillingData> {
    const data = await getApiUsageBillingData(from, to, clientId)
    return data
} 