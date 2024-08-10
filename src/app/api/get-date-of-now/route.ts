import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })

        const date= new Date()
        // format: jueves 8 de agosto de 2024
        const data= format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })

        return NextResponse.json( { data }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

