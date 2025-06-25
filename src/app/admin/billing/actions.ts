"use server"

import { getBillingData } from "@/services/conversationService"
import { getApiUsageBillingData, ApiUsageData } from "@/services/apiUsageService"

// Re-export types for components
export type { ApiUsageData } from "@/services/apiUsageService"

export type CompleteData= {
    totalCost: number
    billingData: BillingData[]
    apiUsageData?: ApiUsageData[]  // New: API usage data
    totalApiUsageCost?: number     // New: Total API usage cost
}

export type BillingData= {
    clientName: string
    modelName: string
    promptTokensCost: number
    completionTokensCost: number
    promptTokens: number
    completionTokens: number
    clientPricePerPromptToken: number
    clientPricePerCompletionToken: number
}

export async function getBillingDataAction(from: Date, to: Date, clientId?: string): Promise<CompleteData> {
    // Get chat billing data
    const chatData = await getBillingData(from, to, clientId)
    
    // Get API usage billing data
    const apiUsageData = await getApiUsageBillingData(from, to, clientId)

    return {
        totalCost: chatData.totalCost + apiUsageData.totalCost,
        billingData: chatData.billingData,
        apiUsageData: apiUsageData.usageData,
        totalApiUsageCost: apiUsageData.totalCost
    }
}

// Action to get only API usage data
export async function getApiUsageBillingDataAction(from: Date, to: Date, clientId?: string) {
    const data = await getApiUsageBillingData(from, to, clientId)
    return data
}