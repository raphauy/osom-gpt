"use server"

import { getFormatInTimezone } from "@/lib/utils"
import { getTimezone } from "@/services/clientService"
import { deleteConversation, getConversation, getConversationsOfClient, getLastConversation } from "@/services/conversationService"
import { Client, Conversation, Message } from "@prisma/client"
import { revalidatePath } from "next/cache"


export type DataMessage = {
    id: string
    fecha: string
    updatedAt: Date
    role: string
    content: string
    gptData: string | null
    promptTokens: number
    completionTokens: number
}

export type DataConversation = {
    id: string
    fecha: string
    updatedAt: string
    celular: string
    messages: DataMessage[]
    clienteNombre: string
    clienteSlug: string
    clienteId?: string
    operacion?: string
    tipo?: string
    zona?: string
    presupuesto?: string
    llmOff: boolean | null
}

export type DataConversationShort = {
    id: string
    createdAt: Date
    updatedAt: Date
    phone: string
    client: {
        name: string
        slug: string
        timezone: string
    }
}

export async function getDataConversationAction(conversationId: string): Promise<DataConversation | null>{
    const conversation= await getConversation(conversationId)
    if (!conversation) return null

    const clientTimeZone= await getTimezone(conversation.clientId) || "America/Montevideo"
    const data= getData(conversation, clientTimeZone)
    
    return data
}

export async function getLastDataConversationAction(slug: string): Promise<DataConversation | null>{
    const conversation= await getLastConversation(slug)
    if (!conversation) return null

    const clientTimeZone= await getTimezone(conversation.clientId) || "America/Montevideo"
    const data= getData(conversation, clientTimeZone)
    
    return data
}

function getData(conversation: Conversation & { messages: Message[], client: Client }, clientTimeZone: string) {
    const data: DataConversation= {
        id: conversation.id,
        fecha: getFormatInTimezone(conversation.createdAt, clientTimeZone),
        updatedAt: getFormatInTimezone(conversation.updatedAt, clientTimeZone),
        celular: conversation.phone,
        messages: conversation.messages.map((message: Message) => ({
            id: message.id,
            fecha: getFormatInTimezone(message.createdAt, clientTimeZone),
            updatedAt: message.updatedAt,
            role: message.role,
            content: message.content,
            gptData: message.gptData,
            promptTokens: message.promptTokens,
            completionTokens: message.completionTokens,
        })),
        clienteNombre: conversation.client.name,
        clienteSlug: conversation.client.slug,
        clienteId: conversation.clientId,
        operacion: conversation.operacion || undefined,
        tipo: conversation.tipo || undefined,
        zona: conversation.zona || undefined,
        presupuesto: conversation.presupuesto || undefined,
        llmOff: conversation.llmOff
    }
    return data
}


export async function getDataConversations(clientId: string) {
    const conversations= await getConversationsOfClient(clientId)

    const clientTimeZone= await getTimezone(clientId) || "America/Montevideo"
    const data: DataConversation[]= conversations.map(conversation => getData(conversation, clientTimeZone))
    
    return data    
}

export async function getTotalMessages(clientId: string) {
    const conversations= await getConversationsOfClient(clientId)

    let total= 0
    conversations.forEach(conversation => {
        total+= conversation.messages.length
    })
    return total
    
}


export async function eliminate(conversationId: string): Promise<Conversation | null> {    
    const deleted= await deleteConversation(conversationId)

    revalidatePath(`/admin/conversations`)

    return deleted
}

// export async function getSummitIdByConversationIdAction(conversationId: string): Promise<string | undefined> {
//     return getSummitIdByConversationId(conversationId)
// }