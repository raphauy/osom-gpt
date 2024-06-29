import { getCarServiceEntry } from "@/services/carservice-services";
import { getNarvaezEntry } from "@/services/narvaez-services";
import { getRepoDataDAOByPhone } from "@/services/repodata-services";
import { getSummitEntry } from "@/services/summit-services";
import { JsonValue } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextResponse } from "next/server";

type RepoDataEntryResponse = {
    id: string,
    phone: string,
    repoName: string,
    functionName: string,
    clientName: string,
    date: string,
    data: JsonValue,
}

type Props= {
    params: {
        clientId: string
        repoId: string
    }
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

        const repoId = params.repoId
        if (!repoId) return NextResponse.json({ error: "repoId not found" }, { status: 400 })

        const json= await request.json()
        const message= json.message
        console.log("json: ", json)
        console.log("message: ", message)

        const phone = message.phone
        if (!phone) {
            return NextResponse.json({ error: "phone is required" }, { status: 400 })
        }

        console.log("clientId: ", clientId)
        console.log("repoId: ", repoId)        
        console.log("[Repo Data API] phone: ", phone)

        const repoDataEntry = await getRepoDataDAOByPhone(repoId, phone)
        console.log("[Repo Data API] repoDataEntry: ", repoDataEntry)
        if (!repoDataEntry) {
            return NextResponse.json({ data: "Repo Data Entry not found" }, { status: 200 })
        }

        const data: RepoDataEntryResponse= {
            id: repoDataEntry.id,
            phone,
            repoName: repoDataEntry.repoName,
            functionName: repoDataEntry.functionName,
            clientName: repoDataEntry.client.name,
            date: format(repoDataEntry.createdAt, "yyyy-MM-dd HH:mm", { locale: es }),
            data: repoDataEntry.data,
        }

        return NextResponse.json( { data }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

