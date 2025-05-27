import { config } from "dotenv"
import { getIndicator, getIndicatorByClient, getIndicatorByDay, getIndicatorByMonth, refreshMaterializedViews } from "./analytics-service"
import { generateDescription, getDocumentDAO } from "./document-services"
import { transcribeAudio } from "./transcribe-services"

config()

async function main() {

    console.log("main")

    // let indicatorId= "conversations"
    // const clientId= "clt680esu00004us2ng1axmic"
    // const from= new Date("2024-07-01")
    // const to= new Date("2024-07-31")
    // let indicator= await getIndicator(indicatorId, clientId, from, to)
    // console.log("Conversaciones: ", indicator)

    // indicatorId= "messages"
    // indicator= await getIndicator(indicatorId, clientId, from, to)
    // console.log("Mensajes: ", indicator)

    // //name= "Conversaciones"
    // const list= await getIndicatorByClient(indicatorId, from, to, clientId)
    // console.log("list: ", list)
    // if (list)
    //   console.log("count: ", list.data.length)

    // const byDay= await getIndicatorByDay(indicatorId, from, to, clientId)
    // console.log("byDay: ", byDay)

    // const byMonth= await getIndicatorByMonth(indicatorId, null, null, clientId)
    // console.log("byMonth: ", byMonth)

    // refreshMaterializedViews()

    // const documentId= "clv74xb4p062l9kmfay4dytio"

    // const template= "Genara el índice de un documento llamado {name} con el siguiente contenido: {content}"

    // const description= await generateDescription(documentId)
    //console.log("description: ", description)

    const audioUrl= "https://x29crcefil.ufs.sh/f/3yL8ZgOp4Od5B93WBrxo1UKWYalJrPRSsGMj3wIcoAOxN4qe"

    const text= await transcribeAudio(audioUrl)
    console.log("text: ", text)

}
  
//main()
  
