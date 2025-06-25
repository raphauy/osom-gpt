import { readImage } from "@/services/vision-services";
import { getClient } from "@/services/clientService";
import { recordImageUsage } from "@/services/apiUsageService";
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
        const imageUrl= json.imageUrl
        console.log("json: ", json)
        console.log("imageUrl: ", imageUrl)

        if (!imageUrl) {
            return NextResponse.json({ error: "imageUrl is required" }, { status: 400 })
        }

        // Obtener el cliente y su imagePrompt
        const client = await getClient(clientId)
        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 })
        }

        if (!client.imagePrompt) {
            return NextResponse.json({ error: "Client does not have an image prompt configured" }, { status: 400 })
        }

        console.log("client name: ", client.name)
        console.log("analyzing image: ", imageUrl)
        console.log("with prompt: ", client.imagePrompt)

        const result = await readImage(imageUrl, client.imagePrompt)
        if (!result.description) {
            return NextResponse.json({ error: `error analyzing image` }, { status: 404 })
        }

        // Record API usage for billing
        try {
            await recordImageUsage(
                clientId,
                result.usage.promptTokens,
                result.usage.completionTokens,
                result.usage.totalTokens
            )
            console.log("Image usage recorded successfully")
        } catch (error) {
            console.error("Error recording image usage:", error)
            // Don't fail the request if usage recording fails
        }

        return NextResponse.json({ 
            description: result.description,
            usage: {
                promptTokens: result.usage.promptTokens,
                completionTokens: result.usage.completionTokens,
                totalTokens: result.usage.totalTokens
            }
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
} 