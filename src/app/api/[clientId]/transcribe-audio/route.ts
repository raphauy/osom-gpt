import { attachRestart, getLastConversationByPhone } from "@/services/conversationService";
import { transcribeAudio } from "@/services/transcribe-services";
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
        const audioUrl= json.audioUrl
        console.log("json: ", json)
        console.log("audioUrl: ", audioUrl)

        if (!audioUrl) {
            return NextResponse.json({ error: "audioUrl is required" }, { status: 400 })
        }

        console.log("transcribe audio: ", audioUrl)

        const result = await transcribeAudio(audioUrl)
        if (!result.text) {
            return NextResponse.json({ error: `error transcribing audio` }, { status: 404 })
        }

        return NextResponse.json({ 
            text: result.text,
            durationInSeconds: result.durationInSeconds 
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

