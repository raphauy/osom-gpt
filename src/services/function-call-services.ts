import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { getDateOfNow, getDocument, getSection, notifyHuman, registrarPedido } from "./functions";
import { preprocessTextForJsonParse } from "@/lib/utils";

type CompletionInitResponse = {
  assistantResponse: string | null
  promptTokens: number
  completionTokens: number
  agentes: boolean  
}

export async function completionInit(clientId: string, functions: ChatCompletionCreateParams.Function[], messages: ChatCompletionMessageParam[]): Promise<CompletionInitResponse | null>{
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  let completionResponse= null
  let agentes= false

  let baseArgs = {
    model: "gpt-4-1106-preview",
    temperature: 0,
    messages
  }  

  const args = functions.length > 0 ? { ...baseArgs, functions: functions, function_call: "auto" } : baseArgs  

  const initialResponse = await openai.chat.completions.create(args as any);

  const usage= initialResponse.usage
  console.log("\tusage:")
  let promptTokens= usage ? usage.prompt_tokens : 0
  let completionTokens= usage ? usage.completion_tokens : 0
  console.log("\t\tpromptTokens: ", promptTokens)
  console.log("\t\tcompletionTokens: ", completionTokens)  

  let wantsToUseFunction = initialResponse.choices[0].finish_reason == "function_call"

  let assistantResponse: string | null = ""

  if (wantsToUseFunction) {
    console.log("\twantsToUseFunction!")

    const functionCall= initialResponse.choices[0].message.function_call
    if (!functionCall) throw new Error("No function_call message")

    const name= functionCall.name
    let args = JSON.parse(functionCall.arguments || "{}")      

    const content= await processFunctionCall(clientId, name, args)

    messages.push(initialResponse.choices[0].message)
    messages.push({
      role: "function",
      name, 
      content,
    })
    agentes= getAgentes(name)

    const stepResponse = await completionInit(clientId, functions, messages)
    if (!stepResponse) return null

    return {
      assistantResponse: stepResponse.assistantResponse,
      promptTokens: stepResponse.promptTokens + promptTokens,
      completionTokens: stepResponse.completionTokens + completionTokens,
      agentes: stepResponse.agentes || agentes
    }

  } else {
    console.log("\tsimple response!")      
    assistantResponse = initialResponse.choices[0].message.content
    completionResponse= { assistantResponse, promptTokens, completionTokens, agentes }
    return completionResponse
  }
}


export async function processFunctionCall(clientId: string, name: string, argumentObj: any) {
    console.log("function_call: ", name, argumentObj)

    let content= null

    switch (name) {
      case "getDateOfNow":
        content = await getDateOfNow()
        break

      case "notifyHuman":
        content = await notifyHuman(clientId)
        break

      case "getDocument":
        content= await getDocument(argumentObj.docId)
        break

      case "getSection":
        content= await getSection(argumentObj.docId, argumentObj.secuence)
        break
      case "registrarPedido":
        content= await registrarPedido(clientId, 
          argumentObj.conversationId, 
          argumentObj.clasificacion, 
          preprocessTextForJsonParse(argumentObj.consulta),
          preprocessTextForJsonParse(argumentObj.nombre),
          argumentObj.email, 
          preprocessTextForJsonParse(argumentObj.horarioContacto),
          argumentObj.idTrackeo, 
          argumentObj.urlPropiedad, 
          preprocessTextForJsonParse(argumentObj.consultaAdicional),
          preprocessTextForJsonParse(argumentObj.resumenConversacion),
        )
        break

      default:
        break
    }

    if (content !== null) {      
      return JSON.stringify(content)
    } else {
      return "function call not found"
    }
}

function getAgentes(name: string): boolean {
  return name === "notifyHuman"
}

