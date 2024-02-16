import { getSystemMessage, messageArrived } from "@/services/conversationService";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";
import { functions, runFunction } from "../../../services/functions";
import { getClient } from "@/services/clientService";
import { getCurrentUser } from "@/lib/auth";
import { getContext, setSectionsToMessage } from "@/services/section-services";
import { removeSectionTexts } from "@/lib/utils";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

//export const runtime = "edge";

export async function POST(req: Request) {

  const { messages: origMessages, clientId } = await req.json()
  const messages= origMessages.filter((message: any) => message.role !== "system")

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
  
  const contextResponse= await getContext(clientId, input)
  console.log("contextContent: " + removeSectionTexts(contextResponse.contextString))

  const systemMessage= getSystemMessage(client.prompt, contextResponse.contextString)
  messages.unshift(systemMessage)
  const created= await messageArrived(phone, systemMessage.content, client.id, "system", "")
  await setSectionsToMessage(created.id, contextResponse.sectionsIds)

  console.log("messages.count: " + messages.length)

  // check if the conversation requires a function call to be made
  const initialResponse = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages,
    temperature: 0,
    stream: true,
    functions,
    function_call: "auto",
  })


  // @ts-ignore
  const stream = OpenAIStream(initialResponse, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      const result = await runFunction(name, args, clientId);
      const newMessages = createFunctionCallMessages(result);
      return openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        stream: true,
        messages: [...messages, ...newMessages],
      });
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
      // check if is text
      if (!completion.includes("function_call")) {
        const messageStored= await messageArrived(phone, completion, client.id, "assistant", "")
        if (messageStored) console.log("assistant message stored")
      } 
    },
  });



  return new StreamingTextResponse(stream);
}
