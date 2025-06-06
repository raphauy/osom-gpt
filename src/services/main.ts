import { config } from "dotenv"
import { getIndicator, getIndicatorByClient, getIndicatorByDay, getIndicatorByMonth, refreshMaterializedViews } from "./analytics-service"
import { generateDescription, getDocumentDAO } from "./document-services"
import { transcribeAudio } from "./transcribe-services"
import { readImage } from "./vision-services"
import { generateEmbedding } from "./embedding-services"

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

    // Prueba de transcripción de audio
    // const audioUrl= "https://x29crcefil.ufs.sh/f/3yL8ZgOp4Od5B93WBrxo1UKWYalJrPRSsGMj3wIcoAOxN4qe"
    // const transcription = await transcribeAudio(audioUrl)
    // console.log("text: ", transcription.text)
    // console.log("duration: ", transcription.durationInSeconds)

    // Prueba de análisis de imagen
    // const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
    // const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/La_Rochelle_-_Vitrail_02.jpg/500px-La_Rochelle_-_Vitrail_02.jpg?20130108105037"
    // const result = await readImage(imageUrl, "Describe esta imagen detalladamente")
    
    // console.log("Descripción de la imagen:", result.description)
    // console.log("Información de uso:")
    // console.log(`- Tokens de prompt: ${result.usage.promptTokens}`)
    // console.log(`- Tokens de completion: ${result.usage.completionTokens}`)
    // console.log(`- Total de tokens: ${result.usage.totalTokens}`)
    
    // // Calcular costo aproximado (precios a mayo 2024)
    // // GPT-4o: $10 por millón de tokens de entrada, $30 por millón de tokens de salida
    // const inputCost = (result.usage.promptTokens / 1000000) * 2;
    // const outputCost = (result.usage.completionTokens / 1000000) * 8;
    // const totalCost = inputCost + outputCost;
    
    // console.log(`Costo estimado: $${totalCost.toFixed(6)} USD`)

    const text= "Hola, ¿cómo estás?"
    const embedding= await generateEmbedding(text)
    console.log("embedding: ", embedding)
}
  
main()
  
