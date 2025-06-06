import { generateEmbedding } from "@/services/embedding-services";
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
        const text= json.text
        console.log("json: ", json)
        console.log("text length: ", text?.length || 0)

        if (!text) {
            return NextResponse.json({ error: "text is required" }, { status: 400 })
        }

        if (typeof text !== 'string') {
            return NextResponse.json({ error: "text must be a string" }, { status: 400 })
        }

        if (text.trim().length === 0) {
            return NextResponse.json({ error: "text cannot be empty" }, { status: 400 })
        }

        console.log("generating embedding for clientId: ", clientId)

        const result = await generateEmbedding(text)
        if (!result.vector || result.vector.length === 0) {
            return NextResponse.json({ error: `error generating embedding` }, { status: 404 })
        }

        return NextResponse.json({ 
            usageTokens: result.usageTokens,
            dimensions: result.dimensions,
            vector: result.vector,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
} 