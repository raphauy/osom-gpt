"use server"
  
import { revalidatePath } from "next/cache"
import { WebhookNotificationDAO, WebhookNotificationFormValues, createWebhookNotification, updateWebhookNotification, deleteWebhookNotification, getWebhookNotificationDAO, resendWebhookNotification } from "@/services/webhook-notifications-service"


export async function getWebhookNotificationDAOAction(id: string): Promise<WebhookNotificationDAO | null> {
    return getWebhookNotificationDAO(id)
}

export async function createOrUpdateWebhookNotificationAction(id: string | null, data: WebhookNotificationFormValues): Promise<WebhookNotificationDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateWebhookNotification(id, data)
    } else {
        updated= await createWebhookNotification(data)
    }     

    revalidatePath("/admin/webhookNotifications")

    return updated as WebhookNotificationDAO
}

export async function deleteWebhookNotificationAction(id: string): Promise<WebhookNotificationDAO | null> {    
    const deleted= await deleteWebhookNotification(id)

    revalidatePath("/admin/webhookNotifications")

    return deleted as WebhookNotificationDAO
}

export async function resendWebhookNotificationAction(id: string): Promise<boolean> {    
    await resendWebhookNotification(id)

    revalidatePath("/admin/webhookNotifications")

    return true
}