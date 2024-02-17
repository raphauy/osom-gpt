import { ClientFormValues } from "@/app/admin/clients/(crud)/clientForm";
import { prisma } from "@/lib/db";


export default async function getClients() {

  const found = await prisma.client.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      users: true
    }
  })

  return found;
};

export async function getFirstClient() {
  
    const found = await prisma.client.findFirst({
      orderBy: {
        id: 'asc',
      },
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
      users: true
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
  
  const created= await prisma.client.update({
    where: {
      id
    },
    data
  })

  return created
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
        id: 'asc',
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