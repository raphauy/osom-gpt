import { NextResponse } from "next/server";


export async function POST(request: Request, { params }: { params: { clientId: string } }) {

    const json= await request.json()
    const message= json.message
    console.log("json: ", json)
    console.log("message: ", message)


    return NextResponse.json( { "data": message }, { status: 200 })

}

export async function GET(request: Request, { params }: { params: { clientId: string } }) {

    const res= "API is working"


    return NextResponse.json( { "data": res }, { status: 200 })

}

