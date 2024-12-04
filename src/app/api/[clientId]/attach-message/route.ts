import { createAttatchMessage, createConversation, getLastConversationByPhone } from "@/services/conversationService";
import { MessageDelayResponse, onMessageReceived, processDelayedMessage } from "@/services/messageDelayService";
import { NextResponse } from "next/server";

export const maxDuration = 299

export async function POST(request: Request, { params }: { params: { clientId: string } }) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })
        
        const clientId = params.clientId
        if (!clientId) return NextResponse.json({ error: "clientId is required" }, { status: 400 })

        const json= await request.json()
        const message= json.message
        console.log("json: ", json)
        console.log("message: ", message)

        const phone = message.phone
        if (!phone) {
            return NextResponse.json({ error: "phone is required" }, { status: 400 })
        }

        const text = message.text
        if (!text) {
            return NextResponse.json({ error: "text is required" }, { status: 400 })
        }

        console.log("phone: ", phone)
        console.log("text: ", text)

        let conversation= await getLastConversationByPhone(phone, clientId)
        if (!conversation) {
            conversation= await createConversation(phone, clientId)
        }

        if (!conversation) {
            return NextResponse.json({ error: `problem creating conversation for phone ${phone}` }, { status: 502 })
        }

        // const created= await createAttatchMessage(conversation.id, text)
        // if (!created) {
        //     return NextResponse.json({ error: `error creating attatch message for phone ${phone}` }, { status: 502 })
        // }
        createAttatchMessage(conversation.id, text)

        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

