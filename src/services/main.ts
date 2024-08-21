import { getIndicator, getIndicatorByClient, getIndicatorByDay, getIndicatorByMonth, refreshMaterializedViews } from "./analytics-service"
import { generateDescription, getDocumentDAO } from "./document-services"

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

    const documentId= "cm01ltkda071vc5vo04bobpau"
    const document= await getDocumentDAO(documentId)
    if (!document) throw new Error("Document not found")
    console.log("document: ", document.textContent)

    const description= await generateDescription("Hola")
    console.log("description: ", description)

}
  
//main()
  
