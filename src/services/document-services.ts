import * as z from "zod"
import { prisma } from "@/lib/db"
import { processSections } from "./section-services"
import OpenAI from "openai";
import { getConfigDAO, getValue } from "./config-services";

export type DocumentDAO = {
	id: string
	name: string
  automaticDescription: boolean
	description: string | undefined
	jsonContent: string | undefined
	textContent: string | undefined
	type: string
	fileSize: number | undefined
	wordsCount: number | undefined
	status: string
	externalId: string | undefined
	url: string | undefined
	createdAt: Date
	updatedAt: Date
	clientId: string
  clientSlug: string
  sectionsCount: number
}

export const documentSchema = z.object({
	name: z.string({required_error: "name is required."}),
  automaticDescription: z.boolean(),
	description: z.string().optional(),
	jsonContent: z.string().optional(),
	textContent: z.string().optional(),
	fileSize: z.number().optional(),
	wordsCount: z.number().optional(),
	clientId: z.string({required_error: "clientId is required."}),
})

export type DocumentFormValues = z.infer<typeof documentSchema>


export async function getDocumentsDAO() {
  const found = await prisma.document.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      client: true,
      sections: true
    }
  })
  const res= found.map((doc) => {
    return {
      ...doc,
      jsonContent: undefined,
      textContent: undefined,
      clientSlug: doc.client.slug,
      sectionsCount: doc.sections.length
    }
  })

  return res as DocumentDAO[]
}

export async function getDocumentsDAOByClient(clientId: string) {
  const found = await prisma.document.findMany({
    where: {
      clientId
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      client: true,
      sections: true
    }
  })
  const res= found.map((doc) => {
    return {
      ...doc,
      jsonContent: undefined,
      textContent: undefined,
      clientSlug: doc.client.slug,
      sectionsCount: doc.sections.length
    }
  })

  return res as DocumentDAO[]
}

export async function getDocumentsByClient(clientId: string) {
  const found = await prisma.document.findMany({
    where: {
      clientId
    },
    include: {
      client: true,
      sections: true
    }
  })
  return found

}

export async function getDocumentsCount() {
  const count = await prisma.document.count()
  return count
}

export async function getDocumentDAO(id: string) {
  const found = await prisma.document.findUnique({
    where: {
      id
    },
    include: {
      client: true,
      sections: true
    }
  })
  if (!found) return null

  const res= {
    ...found,
    clientSlug: found.client.slug,
    sectionsCount: found.sections.length
  }

  return res as DocumentDAO
}

export async function getDocumentName(id: string) {
  const found = await prisma.document.findUnique({
    where: {
      id
    },
    select: {
      name: true
    }
  })
  if (!found) return null

  return found.name
}
    
export async function createDocument(data: DocumentFormValues) {
  const created = await prisma.document.create({
    data
  })

  if (!created) return null

  const BASE_PATH= process.env.NEXTAUTH_URL
  const url= `${BASE_PATH}/d/${created.id}`
  const updated = await prisma.document.update({
    where: {
      id: created.id
    },
    data: {
      url
    }
  })

  if (updated.textContent){
    const sections= await processSections(updated.textContent, updated.id)
    console.log("sections", sections)
  }

  return updated
}

export async function updateDocument(id: string, data: DocumentFormValues) {
  const updated = await prisma.document.update({
    where: {
      id
    },
    data
  })
  if (!updated) return null
  if (updated.automaticDescription) {
    console.log("automaticDescription, generating description")    
    const docId= updated.id
    const res= await generateDescription(docId)  
  } else {
    console.log("not automaticDescription, not generating description")
  }

  return updated
}

export async function deleteDocument(id: string) {
  // delete all the sections for the document
  await prisma.section.deleteMany({
    where: {
      documentId: id
    }
  })
  const deleted = await prisma.document.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullDocumentsDAO() {
  const found = await prisma.document.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
		}
  })
  return found as DocumentDAO[]
}
  
export async function getFullDocumentDAO(id: string) {
  const found = await prisma.document.findUnique({
    where: {
      id
    },
    include: {
		}
  })
  return found as DocumentDAO
}
    

export async function updateContent(id: string, textContent: string, jsonContent: string) {
  const wordsCount= textContent.split(" ").length
  const updated = await prisma.document.update({
    where: {
      id
    },
    data: {
      textContent,
      jsonContent,
      wordsCount
    }
  })

  const sections= await processSections(textContent, id)
  console.log("sections", sections)

  if (updated.automaticDescription) {
    console.log("automaticDescription, generating description")    
    const docId= updated.id
    const res= await generateDescription(docId)  
  }
  
  return updated
}

export async function updateDescription(id: string, description: string) {
  const updated= await prisma.document.update({
    where: {
      id
    },
    data: {
      description
    }
  })
  return updated
}

export async function generateDescription(id: string, template?: string) {
  console.log("generating description...")

  if (!template) {
    const descriptionTemplate= await getValue("DOCUMENT_DESCRIPTION_PROMPT")    
    if (!descriptionTemplate) throw new Error("DOCUMENT_DESCRIPTION_PROMPT not found")
    template= descriptionTemplate
  }

  const document= await getFullDocumentDAO(id)
  if (!document) throw new Error("Document not found")

  const name= document.name
  const content= document.textContent

  if (!name || !content) throw new Error("name or content not found")

  const descriptionPrompt= template.replace("{name}", name).replace("{content}", content)
  console.log("descriptionPrompt: ", descriptionPrompt)  

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY_FOR_EMBEDDINGS,
  })

  const messages= [
    {
      role: "system",
      content: descriptionPrompt,
    },
  ]

  const baseArgs = {
    model: "gpt-4o-2024-08-06",
    temperature: 0.1,
    messages
  }  

  const initialResponse = await openai.chat.completions.create(baseArgs as any);

  const description= initialResponse.choices[0].message.content

  console.log("description:")
  console.log(description)

  if (!description) return false

  // update the document description
  await updateDescription(id, description)

  return true
}

