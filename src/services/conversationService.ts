import { prisma } from "@/lib/db";

import { BillingData, CompleteData } from "@/app/admin/billing/actions";
import { removeSectionTexts } from "@/lib/utils";
import { ChatCompletionMessageParam, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources/index.mjs";
import { getFunctionsDefinitions } from "./function-services";
import { sendWapMessage } from "./osomService";
import { getContext, setSectionsToMessage } from "./section-services";
import { completionInit } from "./function-call-services";


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   //organization: "org-"
// })

export default async function getConversations() {

  const found = await prisma.conversation.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: true
    }
  })

  return found;
}

// if clientId = "ALL" then return all conversations
export async function getConversationsOfClient(clientId: string) {
  const where= clientId === "ALL" ? {} : {
    clientId
  }

  const found = await prisma.conversation.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: true,
      messages: true
    }
  })

  // const found = await prisma.conversation.findMany({
  //   where: {
  //     clientId
  //   },
  //   orderBy: {
  //     createdAt: 'desc',
  //   },
  //   include: {
  //     client: true,
  //     messages: true
  //   }
  // })

  return found;
}


// an active conversation is one that has a message in the last 10 minutes
export async function getActiveConversation(phone: string, clientId: string) {
    
    const found = await prisma.conversation.findFirst({
      where: {
        phone,
        clientId,        
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 10 * 60 * 1000)
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true
      }
    })
  
    return found;
}

export async function getActiveMessages(phone: string, clientId: string) {

  const activeConversation= await getActiveConversation(phone, clientId)
  if (!activeConversation) return null

  const messages= await prisma.message.findMany({
    where: {
      conversationId: activeConversation.id
    },
    orderBy: {
      createdAt: 'asc',
    }
  })

  return messages
}

export async function getConversation(id: string) {

  const found = await prisma.conversation.findUnique({
    where: {
      id
    },
    include: {
      client: true,
      messages:  {
        orderBy: {
          createdAt: 'asc',
        },
      }
    },
  })

  return found
}

export async function getLastConversation(slug: string) {
    
    const found = await prisma.conversation.findFirst({
      where: {
        client: {
          slug
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        client: true,
        messages:  {
          orderBy: {
            createdAt: 'asc',
          },
        }
      },
    })
  
    return found  
}

// find an active conversation or create a new one to connect the messages
export async function messageArrived(phone: string, text: string, clientId: string, role: string, gptData: string, promptTokens?: number, completionTokens?: number) {

  const activeConversation= await getActiveConversation(phone, clientId)
  if (activeConversation) {
    const message= await createMessage(activeConversation.id, role, text, gptData, promptTokens, completionTokens)
    return message    
  } else {
    const created= await prisma.conversation.create({
      data: {
        phone,
        clientId,
      }
    })
    const message= await createMessage(created.id, role, text, gptData, promptTokens, completionTokens)
    return message   
  }
}


export async function processMessage(id: string) {
  const message= await prisma.message.findUnique({
    where: {
      id
    },
    include: {
      conversation: {
        include: {
          messages: true,
          client: true
        }
      }
    }
  })
  if (!message) throw new Error("Message not found")

  const conversation= message.conversation

  const client= conversation.client

  //const messages= getGPTMessages(conversation.messages as ChatCompletionMessageParam[])
  if (!client.prompt) throw new Error("Client prompt not found")
  const input= message.content

  const contextResponse= await getContext(client.id, conversation.phone, input)
  console.log("contextContent: " + removeSectionTexts(contextResponse.contextString))

  const systemMessage= getSystemMessage(client.prompt, contextResponse.contextString)

  const filteredMessages= conversation.messages.filter((message) => message.role !== "system")
  const messages: ChatCompletionMessageParam[]= getGPTMessages(filteredMessages as ChatCompletionUserOrSystem[], systemMessage)

  const created= await messageArrived(conversation.phone, systemMessage.content, client.id, "system", "")
  await setSectionsToMessage(created.id, contextResponse.sectionsIds)

  console.log("messages.count: " + messages.length)

  //TODO
  const functions= await getFunctionsDefinitions(client.id)

  const completionResponse= await completionInit(client.id,functions, messages)
  if (completionResponse === null) {
    console.log("completionInit returned null")
    return
  }
  
  const assistantResponse= completionResponse.assistantResponse
  const gptData= null
  const notificarAgente= completionResponse.agentes
  const promptTokens= completionResponse.promptTokens
  const completionTokens= completionResponse.completionTokens

  if (assistantResponse) {
    const gptDataString= JSON.stringify(gptData)
    await messageArrived(conversation.phone, assistantResponse, conversation.clientId, "assistant", gptDataString, promptTokens, completionTokens)
  }

  if (assistantResponse) {
    console.log("notificarAgente: " + notificarAgente)
    
    sendWapMessage(conversation.phone, assistantResponse, notificarAgente, conversation.clientId)
  } else {
    console.log("assistantResponse is null")
  }   
  
  
}

type ChatCompletionUserOrSystem= ChatCompletionUserMessageParam | ChatCompletionSystemMessageParam

//function getGPTMessages(messages: (ChatCompletionUserMessageParam | ChatCompletionSystemMessageParam)[], clientPrompt: string) {
function getGPTMessages(messages: ChatCompletionUserOrSystem[], systemPrompt: ChatCompletionSystemMessageParam) {


  // const gptMessages: ChatCompletionMessageParam[]= [systemPrompt]
  const gptMessages: ChatCompletionUserOrSystem[]= [systemPrompt]
  for (const message of messages) {
    let content= message.content
    if (Array.isArray(content)) {
      content= content.join("\n")
    } else if (content === null) {
      content= ""
    }

    gptMessages.push({
      role: message.role,
      content
    })
  }
  return gptMessages
}


export function getSystemMessage(prompt: string, contextContent: string): ChatCompletionSystemMessageParam {
  const content= prompt + "\n" + contextContent

  const systemMessage: ChatCompletionMessageParam= {
    role: "system",
    content
  }
  return systemMessage
  
}


function createMessage(conversationId: string, role: string, content: string, gptData?: string, promptTokens?: number, completionTokens?: number) {
  const created= prisma.message.create({
    data: {
      role,
      content,
      gptData,
      conversationId,      
      promptTokens,
      completionTokens,
    }
  })

  return created
}
  


export async function updateConversation(id: string, role: string, content: string) {

  const newMessage= await prisma.message.create({
    data: {
      role,
      content,
      conversationId: id,
    }
  })
  
  const updated= await prisma.conversation.update({
    where: {
      id
    },
    data: {
      messages: {
        connect: {
          id: newMessage.id
        }
      }
    }
    })

  return updated
}

export async function setSearch(id: string, operacion: string, tipo: string, presupuesto: string, zona: string) {

  const updated= await prisma.conversation.update({
    where: {
      id
    },
    data: {
      operacion,
      tipo,
      presupuesto,
      zona,
    }
    })

  return updated
}


export async function deleteConversation(id: string) {
  
  const deleted= await prisma.conversation.delete({
    where: {
      id
    },
  })

  return deleted
}

const PROMPT_TOKEN_PRICE = 0.01
const COMPLETION_TOKEN_PRICE = 0.03

export async function getBillingData(from: Date, to: Date, clientId?: string): Promise<CompleteData> {  

  const messages= await prisma.message.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to
      },
      conversation: {
        clientId: clientId
      }
    },
    include: {
      conversation: {
        include: {
          client: true
        }
      }
    }
  })

  const billingData: BillingData[]= []

  const clientMap: {[key: string]: BillingData}= {}

  for (const message of messages) {    
    const clientName= message.conversation.client.name
    const promptTokens= message.promptTokens ? message.promptTokens : 0
    const completionTokens= message.completionTokens ? message.completionTokens : 0

    if (!clientMap[clientName]) {
      clientMap[clientName]= {
        clientName,
        promptTokens,
        completionTokens,
        clientPricePerPromptToken: message.conversation.client.promptTokensPrice,
        clientPricePerCompletionToken: message.conversation.client.completionTokensPrice,
      }
    } else {
      clientMap[clientName].promptTokens+= promptTokens
      clientMap[clientName].completionTokens+= completionTokens
    }
  }

  let totalCost= 0

  for (const key in clientMap) {
    billingData.push(clientMap[key])
    totalCost+= (clientMap[key].promptTokens / 1000 * PROMPT_TOKEN_PRICE) + (clientMap[key].completionTokens / 1000 * COMPLETION_TOKEN_PRICE)
  }

  // sort billingData by promptTokens
  billingData.sort((a, b) => {
    return b.promptTokens - a.promptTokens
  })

  const res: CompleteData= {
    totalCost,
    pricePerPromptToken: PROMPT_TOKEN_PRICE,
    pricePerCompletionToken: COMPLETION_TOKEN_PRICE,
    billingData
  }
  
  return res
}