"use server"
  
import { deleteConversation } from "@/services/conversationService"
import { revalidatePath } from "next/cache"


export async function deleteConversationAction(id: string): Promise<boolean> {
    const deleted= await deleteConversation(id)

    if (!deleted) return false

    revalidatePath(`/chats`)

    return true
}
