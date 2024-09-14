import { MessageDelayResponse, onMessageReceived, processDelayedMessage } from "@/services/messageDelayService";
import { NextResponse } from "next/server";


export const maxDuration = 299

type Props= {
    params: {
        clientId: string
    }
}

export async function POST(request: Request, { params }: Props) {

    try {
        const json= await request.json()
        console.log("json: ", json)
        const event= json.event
        console.log("event: ", event)
        const instanceName= json.instance
        console.log("instanceName: ", instanceName)
        const fromMe= json.data.key.fromMe
        console.log("fromMe: ", fromMe)
        const phone= json.data.key.remoteJid.split("@")[0]
        const pushName= json.data.pushName
        console.log("pushName: ", pushName)
        const text= json.data.message.conversation
        const messageType= json.data.messageType
        console.log("messageType: ", messageType)
        const dateTimestamp= new Date(json.data.messageTimestamp * 1000)
        const zonedDateTimestamp= dateTimestamp.toLocaleString('es-UY', { timeZone: 'America/Montevideo' })
        console.log("zonedDateTimestamp: ", zonedDateTimestamp)
    
        const clientId = params.clientId
        if (!clientId) return NextResponse.json({ error: "clientId not found, probably wrong url" }, { status: 400 })
    
        if (!phone) {
            return NextResponse.json({ error: "phone is required" }, { status: 400 })
        }
    
        if (!text) {
            return NextResponse.json({ error: "text is required" }, { status: 400 })
        }
    
        console.log("phone: ", phone)
        console.log("text: ", text)
    
        const delayResponse: MessageDelayResponse= await onMessageReceived(phone, text, clientId, "user", "")
        console.log(`delayResponse wasCreated: ${delayResponse.wasCreated}`)
        console.log(`delayResponse message: ${delayResponse.message ? delayResponse.message.id : "null"}`)
    
        if (delayResponse.wasCreated ) {
            if (delayResponse.message) {
                await processDelayedMessage(delayResponse.message.id, phone)                
            } else {
                console.log("delayResponse.message wasCreated but is null")
                return NextResponse.json({ error: "there was an error processing the message" }, { status: 502 })
            }
        } else {
            console.log(`message from ${phone} was updated, not processed`)
        }        
    
        return NextResponse.json({ data: "ACK" }, { status: 200 })
    
    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({ error: "error: " + error}, { status: 502 })                
    }

}

export async function GET(request: Request, { params }: { params: { clientId: string } }) {

    const res= "API is working"


    return NextResponse.json( { "data": res }, { status: 200 })

}

// example:
// {
//     event: 'messages.upsert',
//     instance: 'demo-whatsapp',
//     data: {
//       key: {
//         remoteJid: '59898353507@s.whatsapp.net',
//         fromMe: false,
//         id: '3EB0CEA22F8A61C113CBCB'
//       },
//       pushName: 'Raphael Carvalho',
//       message: { conversation: '3', messageContextInfo: [Object] },
//       messageType: 'conversation',
//       messageTimestamp: 1726245363,
//       instanceId: '440863f7-a8fc-487a-b222-22dd6fea80d9',
//       source: 'web'
//     },
//     destination: 'https://local.rctracker.dev/api/cm10wjbo20005ozcqfki0l1f9/wrc',
//     date_time: '2024-09-13T13:36:03.808Z',
//     sender: '59893300642@s.whatsapp.net',
//     server_url: 'https://wapi.raphauy.dev',
//     apikey: '3521D8B9-A5DE-4AA6-8F68-F114CBBAC44A'
//   }
// {
//     event: 'messages.upsert',
//     instance: 'cantinabarreiro',
//     data: {
//       key: {
//         remoteJid: '120363289305091732@g.us',
//         fromMe: false,
//         id: '3EB0821728E0FD78CAF759',
//         participant: '59895983155@s.whatsapp.net'
//       },
//       pushName: 'Martiniano Sienra',
//       message: { conversation: 'dale!' },
//       messageType: 'conversation',
//       messageTimestamp: 1726242362,
//       instanceId: '1b75f079-28b9-49f8-b931-636a505d4e9c',
//       source: 'web'
//     },
//     destination: 'https://local.rctracker.dev/api/clsnvcntc003okaqc2gfrme4b/wrc',
//     date_time: '2024-09-13T12:46:02.645Z',
//     sender: '59898353507@s.whatsapp.net',
//     server_url: 'https://wapi.raphauy.dev',
//     apikey: 'B7325DC0-2C05-4EEF-93CC-9FBEDD25CE4B'
//   }