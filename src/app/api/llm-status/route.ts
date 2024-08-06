import { NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
});

const password= process.env.API_TOKEN || "No configurado"

export async function POST(request: Request) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })
        
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Say only: WORKING" }],
            model: "gpt-4o-mini",
        })
        const messageResponse = chatCompletion.choices[0].message
        console.log("LLM working")

        const data= "ok"

        return NextResponse.json( { data }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

