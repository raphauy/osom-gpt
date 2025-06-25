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

export async function setImagePrompt(imagePrompt: string, clientId: string) {
  const client= await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      imagePrompt
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

// Nueva función para actualizar precios de APIs
export async function setApiTokensPrice(
  clientId: string, 
  imagePromptTokensPrice: number, 
  imageCompletionTokensPrice: number,
  audioSecondsPrice: number,
  embeddingTokensPrice: number
) {
  console.log(`Setting API prices for client ${clientId}:`, {
    imagePromptTokensPrice,
    imageCompletionTokensPrice,
    audioSecondsPrice,
    embeddingTokensPrice
  })
  
  const client = await prisma.client.update({
    where: {
      id: clientId
    },
    data: {
      imagePromptTokensPrice,
      imageCompletionTokensPrice,
      audioSecondsPrice,
      embeddingTokensPrice
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
  const startTime = performance.now();

  const results = await prisma.$transaction([
    // Obtener cliente con conteos de documentos, conversaciones y usuarios
    prisma.client.findUniqueOrThrow({
      where: { id: clientId },
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            documents: true,
            conversations: true,
            users: true,
          }
        }
      }
    }),
    // Obtener conteo de mensajes
    prisma.$queryRaw`
      SELECT COUNT(m.id) as message_count
      FROM "Message" m
      JOIN "Conversation" c ON c.id = m."conversationId"
      WHERE c."clientId" = ${clientId}
    `
  ]);

  const [client, messageCountResult] = results;
  const messageCount = (messageCountResult as Array<{ message_count: number }>)[0];
  
  const data = {
    clientName: client.name,
    clientSlug: client.slug,
    documents: client._count.documents,
    conversations: client._count.conversations,
    messages: Number(messageCount.message_count),
    users: client._count.users
  };

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`getCountData ejecutado en ${executionTime.toFixed(2)}ms`);

  return data;
}

export async function getCountDataOfAllClients(): Promise<CountData[]> {
  const startTime = performance.now();

  const results = await prisma.$transaction([
    // Obtener clientes con conteos de documentos, conversaciones y usuarios
    prisma.client.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            documents: true,
            conversations: true,
            users: true,
          }
        }
      }
    }),
    // Obtener conteo de mensajes agrupados por clientId
    prisma.$queryRaw`
      SELECT c."clientId", COUNT(m.id) as message_count
      FROM "Message" m
      JOIN "Conversation" c ON c.id = m."conversationId"
      GROUP BY c."clientId"
    `
  ]);

  const [clientsWithCounts, messagesCounts] = results;
  
  // Crear mapa de clientId -> conteo de mensajes
  const messageCountMap = new Map(
    (messagesCounts as { clientId: string, message_count: number }[])
      .map(mc => [mc.clientId, Number(mc.message_count)])
  );

  const data = clientsWithCounts.map(client => ({
    clientName: client.name,
    clientSlug: client.slug,
    documents: client._count.documents,
    conversations: client._count.conversations,
    messages: messageCountMap.get(client.id) || 0,
    users: client._count.users
  }));

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`getCountDataOfAllClients ejecutado en ${executionTime.toFixed(2)}ms`);

  return data;
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