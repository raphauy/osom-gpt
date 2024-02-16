"use server"

import { getActiveMessages } from "@/services/conversationService"
import { getSectionsOfMessage } from "@/services/section-services"


export async function getActiveMessagesAction(phone: string, clientId: string){
    const messages= await getActiveMessages(phone, clientId)
    return messages
}

export async function getSectionsOfMessageAction(messageId: string): Promise<string[]>{
    const sections= await getSectionsOfMessage(messageId)
    
    return sections.map((section) => section.sectionId)
}