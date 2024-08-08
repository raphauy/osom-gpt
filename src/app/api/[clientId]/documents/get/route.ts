import { getClient } from "@/services/clientService";
import { getDocumentDAO } from "@/services/document-services";
import { getSectionCountOfDocument } from "@/services/section-services";
import { NextResponse } from "next/server";

type Props= {
    params: {
        clientId: string
    },
    // searchParams: {
    //     documentId: string
    // }
}

export async function POST(request: Request, { params }: Props) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })
        
        const clientId = params.clientId
        if (!clientId) return NextResponse.json({ error: "clientId not found" }, { status: 400 })

        const json= await request.json()
        console.log("json: ", json)
        const documentId= json.documentId

        if (!documentId) return NextResponse.json({ error: "documentId is required" }, { status: 400 })

        const document= await getDocumentDAO(documentId)
        if (!document) return NextResponse.json({ error: "document not found" }, { status: 400 })

        const documentResponse= {
            id: document.id,
            name: document.name,
            description: document.description || "",
            content: document.textContent || "",
            url: document.url || "",
        }
        
        return NextResponse.json( { "data": documentResponse }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}


type SummitEntryResponse = {
    data:{
        phone: string,
        nombreReserva: string | null,
        nombreCumpleanero: string | null,
        cantidadInvitados: number | null,
        fechaReserva: string | null,
        email: string | null,
        resumenConversacion: string | null,
        fecha: string,
    }
}

function getJsonContent(content: string) {
    const json= {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":content}]}]}
    return json
    
}