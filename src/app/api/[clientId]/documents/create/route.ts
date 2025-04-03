import { getClient } from "@/services/clientService";
import { DocumentFormValues, createDocument, updateDocument } from "@/services/document-services";
import { getSectionCountOfDocument } from "@/services/section-services";
import { NextResponse } from "next/server";
import { DocumentResponse } from "../route";


export async function POST(request: Request, { params }: { params: { clientId: string } }) {

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

        const name= json.name
        if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })

        const description= json.description
        const content= json.content

        // Crear documento con contenido temporal primero
        const tempContent = "contenido temporal"
        const tempWordsCount = tempContent.split(" ").length
        const tempJsonContent = getJsonContent(tempContent)
        
        const tempFormValues: DocumentFormValues = {
            name,
            description,
            automaticDescription: false,
            jsonContent: JSON.stringify(tempJsonContent),
            textContent: tempContent,
            wordsCount: tempWordsCount, 
            clientId
        }

        // Crear el documento con contenido temporal
        const document = await createDocument(tempFormValues)
        if (!document) return NextResponse.json({ error: "error creating document" }, { status: 400 })

        // Preparar respuesta inmediata
        const client = await getClient(clientId)
        const sectioinsCount = await getSectionCountOfDocument(document.id)

        const documentResponse: DocumentResponse = {
            id: document.id,
            name: document.name,
            description: document.description || "",
            content: document.textContent || "",
            type: document.type,
            wordsCount: document.wordsCount || 0,
            url: document.url || "",
            createdAt: document.createdAt.toISOString(),
            clientId: document.clientId,
            clientName: client?.name || "",
            sectioinsCount
        }
        
        // Actualizar documento con contenido real en segundo plano (sin await)
        const wordsCount = content.split(" ").length
        const jsonContent = getJsonContent(content)
        const realFormValues: DocumentFormValues = {
            name,
            description,
            automaticDescription: false,
            jsonContent: JSON.stringify(jsonContent),
            textContent: content,
            wordsCount, 
            clientId
        }
        
        // Actualizar sin await para que se procese en background
        updateDocument(document.id, realFormValues)
        console.log("Actualizando documento con contenido real en segundo plano...")
        
        // Devolver respuesta rápida con el documento creado
        return NextResponse.json({ "data": documentResponse }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}


function getJsonContent(content: string) {
    const json= {"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":content}]}]}
    return json
    
}