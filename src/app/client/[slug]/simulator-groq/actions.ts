"use server"

import { getCurrentUser } from "@/lib/auth"
import { getMessagesCountOfActiveConversation, messageArrived, processMessage } from "@/services/conversationService"

export async function insertMessageAction(text: string, clientId: string, modelName: string) {

    const currentUser= await getCurrentUser()
    const phone= currentUser?.email || "web-chat"

    const actualMessagesCount= await getMessagesCountOfActiveConversation(phone, clientId)
    console.log("actualMessagesCount: ", actualMessagesCount)

    const created= await messageArrived(phone, text, clientId, "user", "")
    await new Promise(resolve => setTimeout(resolve, 500))
    await processMessage(created.id, modelName)

    // check every 2 seconds the new actualMessagesCount until it is equal to the previous one plus 3
    // the max amount of time is 1 minute
    let actualMessagesCount2= actualMessagesCount
    let time= 0
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      time+= 2000
      if (time > 60000) {
        console.log("timeout")        
        break
      }
      actualMessagesCount2= await getMessagesCountOfActiveConversation(phone, clientId)
      console.log("actualMessagesCount2: ", actualMessagesCount2)      
      if (actualMessagesCount2 === actualMessagesCount + 3) {
        break
      }
    }


    return "ok"
}