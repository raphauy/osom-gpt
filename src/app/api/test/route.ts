import { NextResponse } from "next/server";


export async function POST(request: Request, { params }: { params: { clientId: string } }) {

    const json= await request.json()
    const message= json.message
    console.log("json: ", json)
    console.log("message: ", message)


    return NextResponse.json( { "data": message }, { status: 200 })

}

