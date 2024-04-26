import { getSystemMessage, messageArrived } from "@/services/conversationService";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";
import { runFunction } from "../../../services/functions";
import { getClient } from "@/services/clientService";
import { getCurrentUser } from "@/lib/auth";
import { getContext, setSectionsToMessage } from "@/services/section-services";
import { removeSectionTexts } from "@/lib/utils";
import { getFunctionsDefinitions } from "@/services/function-services";
import openaiTokenCounter from 'openai-gpt-token-counter'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {

  const { messages: origMessages, clientId } = await req.json()
  const messages= origMessages.filter((message: any) => message.role !== "system")
  // replace role function by system
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === "function") {
      messages[i].role = "system"
    }
  }

  const client= await getClient(clientId)
  if (!client) {
    return new Response("Client not found", { status: 404 })
  }
  if (!client.prompt) {
    return new Response("Client prompt not found", { status: 404 })
  }

  const currentUser= await getCurrentUser()
  const phone= currentUser?.email || "web-chat"

  // get rid of messages of type system
  const input= messages[messages.length - 1].content
  console.log("input: " + input)
  

  const contextResponse= await getContext(clientId, phone, input)
  console.log("contextContent: " + removeSectionTexts(contextResponse.contextString))

  const systemMessage= getSystemMessage(client.prompt, contextResponse.contextString)
  messages.unshift(systemMessage)
  const created= await messageArrived(phone, systemMessage.content, client.id, "system", "")
  await setSectionsToMessage(created.id, contextResponse.sectionsIds)

  console.log("messages.count: " + messages.length)

  const functions= await getFunctionsDefinitions(clientId)

  // Inicializa el objeto de argumentos con propiedades comunes
  let baseArgs = {
    // model: "gpt-4-1106-preview",
    model: "gpt-4-turbo",
    temperature: 0,
    stream: true,
  };
  let promptTokens= 0
  let completionTokens= 0

  // @ts-ignore
  baseArgs = { ...baseArgs, messages: messages }

  // Si el array de functions tiene al menos un elemento, añade el parámetro functions
  const args = functions.length > 0 ? { ...baseArgs, functions: functions, function_call: "auto" } : baseArgs;

  // Ahora args contiene el parámetro functions solo si el array no estaba vacío
  const initialResponse = await openai.chat.completions.create(args as any);

  // @ts-ignore
  const stream = OpenAIStream(initialResponse, {
    experimental_onFunctionCall: async (
      { name, arguments: args,  },
      createFunctionCallMessages,
    ) => {
      const result = await runFunction(name, args, clientId);
      const newMessages = createFunctionCallMessages(result);

      let baseArgs = {
        // model: "gpt-4-1106-preview",
        model: "gpt-4-turbo",
        stream: true,
      };
    
      // @ts-ignore
      baseArgs = { ...baseArgs, messages: [...messages, ...newMessages] };
      const recursiveArgs = functions.length > 0 ? { ...baseArgs, functions: functions, function_call: "auto" } : baseArgs;

      return openai.chat.completions.create(recursiveArgs as any);

      // return openai.chat.completions.create({
      //   model: "gpt-4-1106-preview",
      //   stream: true,
      //   messages: [...messages, ...newMessages],
      //   functions: functions,
      //   function_call: "auto",
      // });
    },
    onStart: async () => {
      console.log("start")
      const text= messages[messages.length - 1].content
      console.log("text: " + text)
      
      const messageStored= await messageArrived(phone, text, client.id, "user", "")
      if (messageStored) console.log("user message stored")

    },
    onCompletion: async (completion) => {
      console.log("completion: ", completion)

      const partialPromptToken = openaiTokenCounter.chat(messages, "gpt-4") + 1
      console.log(`\tPartial prompt token count: ${partialPromptToken}`)      
      promptTokens += partialPromptToken

      const completionMessages = [
        { role: "assistant", content: completion },
      ]
      const partialCompletionTokens = openaiTokenCounter.chat(completionMessages, "gpt-4")
      console.log(`\tPartial completion token count: ${partialCompletionTokens}`)
      completionTokens += partialCompletionTokens

      if (!completion.includes("function_call")) {
        console.log(`Prompt token count: ${promptTokens}`)
        console.log(`Completion token count: ${completionTokens}`)
        const messageStored= await messageArrived(phone, completion, client.id, "assistant", "", promptTokens, completionTokens)
        if (messageStored) console.log("assistant message stored")
      } else {
        // console.log("function call")
        // const completionObj= JSON.parse(completion)
        // const { name, arguments: args }= completionObj.function_call
//        const text= `Llamando a la función ${name} con los argumentos: ${args}`
        // const text= `Función invocada.`
        // const messageStored= await messageArrived(phone, text, client.id, "function", "", 0, 0)
        // if (messageStored) console.log("function message stored")
      }
    },
  });



  return new StreamingTextResponse(stream);
}
