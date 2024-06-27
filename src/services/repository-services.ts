import * as z from "zod"
import { prisma } from "@/lib/db"
import { FunctionDAO, createFunction } from "./function-services"
import { FieldDAO } from "./field-services"

export type RepositoryDAO = {
	id: string
	name: string
  uiLabel: string
  svgContent: string | undefined
	functionName: string
	functionDescription: string
  functionActive: boolean
  notifyExecution: boolean
	finalMessage: string | undefined
	createdAt: Date
	updatedAt: Date
  functionId: string
  function: FunctionDAO
  fields: FieldDAO[]
}

export const repositorySchema = z.object({
	name: z.string().min(1, "El nombre es obligatorio."),
})

export type RepositoryFormValues = z.infer<typeof repositorySchema>


export async function getRepositorysDAO() {
  const found = await prisma.repository.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as RepositoryDAO[]
}

export async function getRepositoryDAO(id: string) {
  const found = await prisma.repository.findUnique({
    where: {
      id
    },
  })
  return found as RepositoryDAO
}
    
export async function createRepository(name: string) {

  // functionName: clean the spaces and lowercase only the first letter
  const functionName= name.replace(/ /g, '').toLowerCase().slice(0, 1) + name.replace(/ /g, '').slice(1)
  const functionDescription= `Editar aquí`
  const parameters: Parameters= {
    type: "object",
    properties: [],
    required: []
  }
  const definition= generateFunctionDefinition(functionName, functionDescription, parameters)

  const repoFunction= await createFunction({
    name: functionName,
    description: functionDescription,
    definition
  })
  if (!repoFunction) throw new Error("Error creating repository function")

  const data= {
    functionId: repoFunction.id,
    name,
    uiLabel: name,
    functionName,
    functionDescription,
    finalMessage: "Datos registrados correctamente. Un asesor te contactará contingo a la brevedad",
  }

  const created = await prisma.repository.create({
    data
  })
  return created
}

export async function updateRepository(id: string, data: RepositoryFormValues) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteRepository(id: string) {
  const deleted = await prisma.repository.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullRepositorysDAO() {
  const found = await prisma.repository.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
		}
  })
  return found as RepositoryDAO[]
}
  
export async function getFullRepositoryDAO(id: string) {
  const found = await prisma.repository.findUnique({
    where: {
      id
    },
    include: {
      function: true,
      fields: true
		}
  })
  return found as RepositoryDAO
}
    

export async function setName(id: string, name: string) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      name,      
    }
  })

  return updated
}

export async function setUILabel(id: string, uiLabel: string) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      uiLabel
    }
  })

  return updated
}

export async function setFunctionName(id: string, functionName: string) {
  // TODO: check if functionName is already taken
  const repo= await getFullRepositoryDAO(id)
  if (!repo) throw new Error("Repository not found")

  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      functionName,
    }
  })

  await updateFunctionDefinition(id)

  return updated
}

export async function setFunctionDescription(id: string, functionDescription: string) {
  const repo= await getFullRepositoryDAO(id)
  if (!repo) throw new Error("Repository not found")

  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      functionDescription,
    }
  })

  await updateFunctionDefinition(id)

  return updated
}

export async function setFinalMessage(id: string, finalMessage: string) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      finalMessage
    }
  })

  return updated
}

export async function setNotifyExecution(id: string, notifyExecution: boolean) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      notifyExecution
    }
  })

  return updated
}

export async function setFunctionActive(id: string, functionActive: boolean) {
  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      functionActive
    }
  })
  return updated
}

export async function updateFunctionDefinition(id: string) {
  const repo= await getFullRepositoryDAO(id)
  if (!repo) throw new Error("Repository not found")

  const fields= repo.fields.sort((a, b) => a.order - b.order)
  const properties= fields.map((field) => ({
    name: field.name,
    type: field.type,
    description: field.description,
  }))
  const required= fields.filter((field) => field.required).map((field) => field.name)
  const parameters: Parameters= {
    type: "object",
    properties,
    required
  }
  
  const updatedDefinition= generateFunctionDefinition(repo.functionName, repo.functionDescription, parameters)

  const updated = await prisma.repository.update({
    where: {
      id
    },
    data: {
      function: {
        update: {
          name: repo.functionName,
          description: repo.functionDescription,
          definition: updatedDefinition
        }        
      }
    }
  })

  return updated
}


export type Property= {
  name: string
  type: "string" | "number" | "boolean"
  description: string
}

export type Parameters= {
  type: "object"
  properties: Property[]
  required: string[]
}

/**
 * Function generation functions
 * this functions are OpenAI function definitions for the function calls
 * example:
 * {
    "name": "notifyHuman",
    "description": "Se debe invocar esta función para notificar a un agente cuando la intención del usuario es hablar con un humano o hablar con un agente o agendar una visita.",
    "parameters": {}
  }
    // parameters will come later
 */
export function generateFunctionDefinition(name: string, description: string, parameters: Parameters): string {
  const jsonParameters = {
    type: "object",
    properties: parameters.properties.reduce((acc: { [key: string]: { type: string; description: string } }, property) => {
      acc[property.name] = {
        type: property.type,
        description: property.description,
      };
      return acc;
    }, {}),
    required: parameters.required,
  };

  const functionDefinition = {
    name: name,
    description: description,
    parameters: jsonParameters,
  };

  // Convert the functionDefinition object to a JSON string with indentation
  const jsonString = JSON.stringify(functionDefinition, null, 2);

  // Verify that the jsonString is valid JSON
  try {
    JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing functionDefinition: ", error);
    throw new Error("Error parsing functionDefinition");
  }

  return jsonString;
}
    