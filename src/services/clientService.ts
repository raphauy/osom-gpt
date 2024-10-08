import { ClientFormValues } from "@/app/admin/clients/(crud)/clientForm";
import { prisma } from "@/lib/db";
import { FunctionDAO } from "./function-services";

export default async function getClients() {

  const found = await prisma.client.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      users: true,
      model: true
    }
  })

  return found;
}

export async function getClientsCount() {

  const found = await prisma.client.count()

  return found;
}

export async function getFirstClient() {
  
    const found = await prisma.client.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    })
  
    return found;
  
}

export async function getLastClient() {
    
    const found = await prisma.client.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        model: true
      }
    })
  
    return found;

}


export async function getClient(id: string) {

  const found = await prisma.client.findUnique({
    where: {
      id
    },
  })

  return found
}

export async function getClientBySlug(slug: string) {

  const found = await prisma.client.findUnique({
    where: {
      slug
    },
    include: {
      users: true,
      model: true,
    }
  })

  return found
}

export async function createClient(data: ClientFormValues) {
  
  const slug= data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  const created= await prisma.client.create({
    data: {
      ...data,
      slug
    }
  })

  return created
}

export async function editClient(id: string, data: ClientFormValues) {
  console.log(data);
  
  const updated= await prisma.client.update({
    where: {
      id
    },
    data
  })

  return updated
}

export async function deleteClient(id: string) {
  
  const deleted= await prisma.client.delete({
    where: {
      id
    },
  })

  return deleted
}

export async function setWhatsAppEndpoing(whatsappEndpoint: string, clientId: string) {
  const client= await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      whatsappEndpoint
    }
  })

  return client  

  
}

export async function setPrompt(prompt: string, clientId: string) {
  const client= await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      prompt
    }
  })

  return client   
}


export async function setTokensPrice(clientId: string, promptTokensPrice: number, completionTokensPrice: number) {
  console.log(clientId, promptTokensPrice, completionTokensPrice)
  
  const client= await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      promptTokensPrice,
      completionTokensPrice
    }
  })

  return client   
}

export type CountData = {
  clientName: string,
  clientSlug: string,
  documents: number,
  conversations: number,
  messages: number,
  users: number
}

export async function getCountData(clientId: string): Promise<CountData> {
  const client= await getClient(clientId)
  if (!client) throw new Error('Client not found')

  const documents= await prisma.document.count({
    where: {
      clientId
    }
  })

  const conversations= await prisma.conversation.count({
    where: {
      clientId
    },
  })

  const messages= await prisma.message.count({
    where: {
      conversation: {
        clientId
      }
    }
  })

  const users= await prisma.user.count({
    where: {
      clientId
    }
  })

  return {
    clientName: client.name,
    clientSlug: client.slug,
    documents,
    conversations,
    messages,
    users
  }
}

export async function getCountDataOfAllClients(): Promise<CountData[]> {
  const clients= await prisma.client.findMany(
    {
      orderBy: {
        createdAt: 'desc'
      }
    }
  )

  const data= await Promise.all(clients.map(async client => {
    const documents= await prisma.document.count({
      where: {
        clientId: client.id
      }
    })
  
    const conversations= await prisma.conversation.count({
      where: {
        clientId: client.id
      },
    })
  
    const messages= await prisma.message.count({
      where: {
        conversation: {
          clientId: client.id
        }
      }
    })
  
    const users= await prisma.user.count({
      where: {
        clientId: client.id
      }
    })

    return {
      clientName: client.name,
      clientSlug: client.slug,
      documents,
      conversations,
      messages,
      users
    }
  }))

  return data
}

export async function getFunctionsOfClient(clientId: string) {
  const client= await prisma.client.findUnique({
    where: {
      id: clientId
    },
    include: {
      functions: true      
    }
  })

  if (!client) return []

  const functionsIds= client.functions.map((f) => f.functionId)

  const functions= await prisma.function.findMany({
    where: {
      id: {
        in: functionsIds
      }
    }
  })

  return functions
}

export async function getComplementaryFunctionsOfClient(clientId: string) {
  const client= await prisma.client.findUnique({
    where: {
      id: clientId
    },
    include: {
      functions: true
    }
  })

  if (!client) return []

  const clientFunctions= client.functions

  const allFunctions= await prisma.function.findMany()

  const complementary= allFunctions.filter((f) => !clientFunctions.find((cf) => cf.functionId === f.id))

  return complementary
}


// model Function {
//   id             String       @id @default(cuid())
//   name           String       @unique             // gennext: show.column
//   description    String?                          // gennext: show.column
//   definition     String?      @db.Text            // gennext: show.column
//   createdAt      DateTime     @default(now())     // gennext: skip.zod
//   updatedAt      DateTime     @updatedAt          // gennext: skip.zod

//   clients        ClientFunction[]                 // gennext: skip.list
// 	@@map("Function")                               // gennext: skip.list
// }

// model ClientFunction {
//   client   Client @relation(fields: [clientId], references: [id])
//   clientId String

//   function  Function @relation(fields: [functionId], references: [id])
//   functionId String
  
//   @@id([clientId, functionId])
// 	@@map("ClientFunction")
// }


// disconnect existing functions and connect new ones
export async function setFunctions(clientId: string, functionIs: string[]) {
  const client= await prisma.client.findUnique({
    where: {
      id: clientId
    },
    include: {
      functions: true
    }
  })

  if (!client) throw new Error('Client not found')

  const clientFunctions= client.functions

  const toDisconnect= clientFunctions.filter((cf) => !functionIs.includes(cf.functionId))
  const toConnect= functionIs.filter((fi) => !clientFunctions.find((cf) => cf.functionId === fi))

  await Promise.all(toDisconnect.map((cf) => prisma.clientFunction.delete({
    where: {
      clientId_functionId: {
        clientId,
        functionId: cf.functionId
      }
    }
  })))

  await Promise.all(toConnect.map((fi) => prisma.clientFunction.create({
    data: {
      clientId,
      functionId: fi
    }
  })))

  return true
}

export async function getComplementaryClients(clientsIds: string[]) {
  const clients = await prisma.client.findMany({
    where: {
      id: {
        notIn: clientsIds
      }
    },
  })
  return clients
}

export async function getClientsMinimal() {
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc'
    }
  })
  return clients
}

export async function getClientName(clientId: string) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId
    },
    select: {
      name: true
    }
  })
  if (!client) return null
  
  return client.name
}

export async function getMessageArrivedDelay(clientId: string) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId
    },
    select: {
      messageArrivedDelay: true
    }
  })
  if (!client) return null
  
  return client.messageArrivedDelay
}

export async function setMessageArrivedDelay(clientId: string, messageArrivedDelay: number) {
  const client = await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      messageArrivedDelay
    }
  })
  return client
}

export async function getMessageArrivedDelayByMessageId(messageId: string) {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId
    },
    select: {
      conversation: {
        select: {
          client: {
            select: {
              messageArrivedDelay: true
            }
          }
        }
      }
    }
  })
  if (!message) 
    throw new Error("Message not found or conversation not found or messageArrivedDelay not found")

  return message.conversation?.client?.messageArrivedDelay
}

export async function setSessionTTL(clientId: string, sessionTTL: number) {
  const client = await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      sessionTTL
    }
  })
  return client
}

export async function getSessionTTL(clientId: string) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId
    },
    select: {
      sessionTTL: true
    }
  })
  if (!client) return null
  
  return client.sessionTTL
}

export async function getTimezone(clientId: string) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId
    },
    select: {
      timezone: true
    }
  })
  if (!client) return null
  
  return client.timezone
}

export async function setTimezone(clientId: string, timezone: string) {
  const client = await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      timezone
    }
  })
  return client
}