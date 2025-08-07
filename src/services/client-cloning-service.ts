import { prisma } from "@/lib/db"
import { z } from "zod"
import { Prisma } from "@prisma/client"

// Validaciones co-ubicadas al inicio
export const cloneClientSchema = z.object({
  sourceClientId: z.string().min(1, "ID de cliente requerido"),
  newName: z.string()
    .min(1, "Nombre requerido")
    .max(100, "Nombre muy largo"),
  includeDocuments: z.boolean().default(true),
  includeFunctions: z.boolean().default(true),
  includeRepositories: z.boolean().default(true),
  includePromptHistory: z.boolean().default(false)
})

export type CloneClientData = z.infer<typeof cloneClientSchema>

export type CloneProgress = {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  progress: {
    current: number
    total: number
    percentage: number
  }
  currentStep?: string
  steps: Array<{
    name: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    itemsProcessed?: number
    itemsTotal?: number
  }>
  result?: {
    newClientId: string
    newClientSlug: string
    newClientName: string
  }
}

export type ClonePreview = {
  source: {
    id: string
    name: string
    slug: string
  }
  itemsToClone: {
    documents: number
    sections: number
    functions: number
    repositories: number
    fields: number
    promptVersions: number
  }
  estimatedTime: number // segundos
}

// Almacenamiento temporal de progreso de trabajos (en producción usar Redis/DB)
const cloneJobs = new Map<string, CloneProgress>()

// Generar slug único a partir del nombre completo
// NOTA: Esta función debe llamarse dentro de una transacción para evitar race conditions
async function generateUniqueSlug(fullName: string, tx?: any): Promise<string> {
  const db = tx || prisma
  
  // Convertir el nombre completo a slug directamente
  let baseSlug = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // Verificar si el slug ya existe
  let slug = baseSlug
  let counter = 1
  
  while (await db.client.findUnique({ where: { slug } })) {
    // Si existe, agregar un número al final
    counter++
    slug = `${baseSlug}-${counter}`
  }
  
  return slug
}

// Función auxiliar para generar nombres con patrón -copia, -copia-2, etc.
function generateCopyName(baseName: string, existingNames: Set<string>): string {
  const baseNameWithoutCopia = baseName.replace(/-copia(-\d+)?$/, '')
  
  // Si no hay copias, sugerir -copia
  let suggestedName = `${baseNameWithoutCopia}-copia`
  
  // Si ya existe -copia, buscar el siguiente número disponible
  if (existingNames.has(suggestedName)) {
    let counter = 2
    suggestedName = `${baseNameWithoutCopia}-copia-${counter}`
    
    while (existingNames.has(suggestedName)) {
      counter++
      suggestedName = `${baseNameWithoutCopia}-copia-${counter}`
    }
  }
  
  return suggestedName
}

// Obtener nombre sugerido para el cliente clonado
export async function getSuggestedCloneName(sourceName: string): Promise<string> {
  const baseNameWithoutCopia = sourceName.replace(/-copia(-\d+)?$/, '')
  
  // Buscar clientes con nombres similares
  const existingClients = await prisma.client.findMany({
    where: { 
      OR: [
        { name: baseNameWithoutCopia },
        { name: { startsWith: `${baseNameWithoutCopia}-copia` } }
      ]
    },
    select: { name: true }
  })
  
  const nameSet = new Set(existingClients.map(c => c.name))
  return generateCopyName(sourceName, nameSet)
}

// Preview de elementos a clonar
export async function getClonePreview(sourceClientId: string): Promise<ClonePreview> {
  const client = await prisma.client.findUniqueOrThrow({
    where: { id: sourceClientId },
    include: {
      documents: { 
        include: { 
          sections: true 
        } 
      },
      functions: {
        include: {
          function: {
            include: {
              repositories: true
            }
          }
        }
      },
      _count: {
        select: {
          documents: true,
          functions: true,
          promptVersions: true
        }
      }
    }
  })
  
  const repositories = await prisma.repository.findMany({
    where: { 
      function: { 
        clients: { 
          some: { 
            clientId: sourceClientId 
          } 
        } 
      } 
    },
    include: { 
      _count: { 
        select: { 
          fields: true 
        } 
      } 
    }
  })
  
  const totalSections = client.documents.reduce(
    (sum, doc) => sum + doc.sections.length, 0
  )
  
  const totalFields = repositories.reduce(
    (sum, repo) => sum + repo._count.fields, 0
  )
  
  // Contar funciones sin repositorios
  const functionsWithoutRepo = client.functions.filter(
    cf => !cf.function.repositories || cf.function.repositories.length === 0
  ).length
  
  // Contar funciones con repositorios (debería coincidir con repositories.length)
  const functionsWithRepo = client.functions.filter(
    cf => cf.function.repositories && cf.function.repositories.length > 0
  ).length
  
  return {
    source: {
      id: client.id,
      name: client.name,
      slug: client.slug
    },
    itemsToClone: {
      documents: client._count.documents,
      sections: totalSections,
      functions: functionsWithoutRepo, // Solo funciones sin repositorios
      repositories: repositories.length,
      fields: totalFields,
      promptVersions: client._count.promptVersions
    },
    estimatedTime: Math.ceil(
      (client._count.documents * 2 + totalSections * 0.5 + repositories.length * 3) / 10
    ) * 10 // Redondeado a 10 segundos
  }
}

// Función principal de clonación
export async function cloneClient(data: CloneClientData) {
  const validated = cloneClientSchema.parse(data)
  const jobId = Math.random().toString(36).substring(7)
  
  // Inicializar progreso
  const progress: CloneProgress = {
    jobId,
    status: 'processing',
    progress: { current: 0, total: 100, percentage: 0 },
    currentStep: 'Iniciando clonación...',
    steps: [
      { name: 'Configuración base del cliente', status: 'processing' },
      { name: 'Documentos y secciones', status: 'pending' },
      { name: 'Funciones', status: 'pending' },
      { name: 'Repositorios y campos', status: 'pending' },
      { name: 'Historial de versiones de prompts', status: 'pending' }
    ]
  }
  
  cloneJobs.set(jobId, progress)
  
  // Ejecutar clonación de forma asíncrona
  executeClone(validated, jobId).catch(error => {
    const progress = cloneJobs.get(jobId)
    if (progress) {
      progress.status = 'failed'
      progress.error = error.message
    }
  })
  
  return { jobId }
}

// Ejecutar clonación con transacción
async function executeClone(data: CloneClientData, jobId: string) {
  const progress = cloneJobs.get(jobId)!
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Paso 1: Clonar cliente base
      progress.currentStep = 'Clonando configuración base del cliente...'
      progress.steps[0].status = 'processing'
      
      const sourceClient = await tx.client.findUniqueOrThrow({
        where: { id: data.sourceClientId },
        include: {
          model: true,
          promptVersions: true
        }
      })
      
      const newSlug = await generateUniqueSlug(data.newName, tx)
      
      const newClient = await tx.client.create({
        data: {
          name: data.newName,
          slug: newSlug,
          description: sourceClient.description,
          url: sourceClient.url,
          whatsappEndpoint: sourceClient.whatsappEndpoint,
          prompt: sourceClient.prompt,
          imagePrompt: sourceClient.imagePrompt,
          promptTokensPrice: sourceClient.promptTokensPrice,
          completionTokensPrice: sourceClient.completionTokensPrice,
          messageArrivedDelay: sourceClient.messageArrivedDelay,
          sessionTTL: sourceClient.sessionTTL,
          timezone: sourceClient.timezone,
          imagePromptTokensPrice: sourceClient.imagePromptTokensPrice,
          imageCompletionTokensPrice: sourceClient.imageCompletionTokensPrice,
          audioSecondsPrice: sourceClient.audioSecondsPrice,
          embeddingTokensPrice: sourceClient.embeddingTokensPrice,
          modelId: sourceClient.modelId
        }
      })
      
      progress.steps[0].status = 'completed'
      progress.progress.current = 25
      progress.progress.percentage = 25
      
      // Paso 2: Clonar documentos y secciones si está habilitado
      if (data.includeDocuments) {
        progress.currentStep = 'Clonando documentos y secciones...'
        progress.steps[1].status = 'processing'
        
        const documents = await tx.document.findMany({
          where: { clientId: data.sourceClientId },
          include: { sections: true }
        })
        
        progress.steps[1].itemsTotal = documents.length
        progress.steps[1].itemsProcessed = 0
        
        for (const doc of documents) {
          const newDoc = await tx.document.create({
            data: {
              clientId: newClient.id,
              name: doc.name,
              automaticDescription: doc.automaticDescription,
              description: doc.description,
              jsonContent: doc.jsonContent,
              textContent: doc.textContent,
              type: doc.type,
              fileSize: doc.fileSize,
              wordsCount: doc.wordsCount,
              status: doc.status,
              externalId: doc.externalId,
              url: doc.url
            }
          })
          
          // Clonar secciones con embeddings
          for (const section of doc.sections) {
            await tx.$executeRaw`
              INSERT INTO "Section" (id, "secuence", "tokenCount", status, "documentId", text, embedding, "createdAt", "updatedAt")
              SELECT 
                gen_random_uuid(),
                ${section.secuence},
                ${section.tokenCount},
                ${section.status},
                ${newDoc.id},
                ${section.text},
                embedding,
                NOW(),
                NOW()
              FROM "Section"
              WHERE id = ${section.id}
            `
          }
          
          progress.steps[1].itemsProcessed!++
        }
        
        progress.steps[1].status = 'completed'
      } else {
        progress.steps[1].status = 'completed'
      }
      
      progress.progress.current = 50
      progress.progress.percentage = 50
      
      // Paso 3: Clonar funciones si está habilitado
      if (data.includeFunctions) {
        progress.currentStep = 'Clonando funciones...'
        progress.steps[2].status = 'processing'
        
        const clientFunctions = await tx.clientFunction.findMany({
          where: { clientId: data.sourceClientId },
          include: {
            function: {
              include: {
                repositories: true
              }
            }
          }
        })
        
        // Solo clonar funciones que NO tienen repositorios
        // Las funciones con repositorios se manejarán en el paso 4
        const functionsWithoutRepo = clientFunctions.filter(
          cf => !cf.function.repositories || cf.function.repositories.length === 0
        )
        
        progress.steps[2].itemsTotal = functionsWithoutRepo.length
        progress.steps[2].itemsProcessed = 0
        
        for (const cf of functionsWithoutRepo) {
          await tx.clientFunction.create({
            data: {
              clientId: newClient.id,
              functionId: cf.functionId,
              webHookUrl: cf.webHookUrl
            }
          })
          progress.steps[2].itemsProcessed!++
        }
        
        progress.steps[2].status = 'completed'
      } else {
        progress.steps[2].status = 'completed'
      }
      
      progress.progress.current = 75
      progress.progress.percentage = 75
      
      // Paso 4: Clonar repositorios y campos si está habilitado
      // Los repositorios siempre vienen con sus propias funciones nuevas para mantener el aislamiento
      if (data.includeRepositories) {
        progress.currentStep = 'Clonando repositorios y campos...'
        progress.steps[3].status = 'processing'
        
        // Obtener las funciones del cliente original a través de ClientFunction
        const clientFunctions = await tx.clientFunction.findMany({
          where: {
            clientId: data.sourceClientId
          },
          include: {
            function: {
              include: {
                repositories: {
                  include: {
                    fields: true
                  }
                }
              }
            }
          }
        })
        
        // Filtrar solo las funciones que tienen repositorios
        const functionsWithRepo = clientFunctions.filter(cf => cf.function.repositories && cf.function.repositories.length > 0)
        
        progress.steps[3].itemsTotal = functionsWithRepo.length
        progress.steps[3].itemsProcessed = 0
        
        // Obtener todos los nombres de repositorios existentes para generar nombres únicos
        const existingRepos = await tx.repository.findMany({
          select: { name: true }
        })
        const existingRepoNames = new Set(existingRepos.map(r => r.name))
        
        for (const cf of functionsWithRepo) {
          const originalFunction = cf.function
          
          // Una función puede tener múltiples repositorios
          for (const originalRepo of originalFunction.repositories) {
            // Generar nuevo nombre de repositorio con el patrón -copia, -copia-2, etc.
            const newRepoName = generateCopyName(originalRepo.name, existingRepoNames)
            existingRepoNames.add(newRepoName) // Agregar al set para evitar duplicados en esta misma operación
            
            // Generar nuevo nombre de función único para el repositorio
            let repoFunctionNameSuffix = 1
            let newRepoFunctionName = `${originalRepo.functionName}_copia`
            
            while (await tx.repository.findUnique({ where: { functionName: newRepoFunctionName } })) {
              repoFunctionNameSuffix++
              newRepoFunctionName = `${originalRepo.functionName}_copia_${repoFunctionNameSuffix}`
            }
            
            // Crear nueva función para el repositorio clonado
            // Generar un nombre único para la función
            let functionSuffix = 1
            let newFunctionName = `${originalFunction.name} (Copia)`
            
            while (await tx.function.findUnique({ where: { name: newFunctionName } })) {
              functionSuffix++
              newFunctionName = `${originalFunction.name} (Copia ${functionSuffix})`
            }
            
            const newFunction = await tx.function.create({
              data: {
                name: newFunctionName,
                description: originalFunction.description,
                definition: originalFunction.definition
              }
            })
            
            // Crear el nuevo repositorio asociado a la nueva función
            const newRepo = await tx.repository.create({
              data: {
                name: newRepoName,
                uiLabel: originalRepo.uiLabel,
                color: originalRepo.color,
                functionName: newRepoFunctionName,
                functionDescription: originalRepo.functionDescription,
                functionActive: originalRepo.functionActive,
                notifyExecution: originalRepo.notifyExecution,
                conversationLLMOff: originalRepo.conversationLLMOff,
                finalMessage: originalRepo.finalMessage,
                llmOffMessage: originalRepo.llmOffMessage,
                functionId: newFunction.id // Nueva función creada
              }
            })
            
            // Clonar campos
            for (const field of originalRepo.fields) {
              await tx.field.create({
                data: {
                  repositoryId: newRepo.id,
                  name: field.name,
                  description: field.description,
                  type: field.type,
                  required: field.required,
                  order: field.order
                }
              })
            }
            
            // Crear la relación ClientFunction para el nuevo cliente con la nueva función
            await tx.clientFunction.create({
              data: {
                clientId: newClient.id,
                functionId: newFunction.id,
                webHookUrl: cf.webHookUrl
              }
            })
          }
          
          progress.steps[3].itemsProcessed!++
        }
        
        progress.steps[3].status = 'completed'
      } else {
        progress.steps[3].status = 'completed'
      }
      
      progress.progress.current = 90
      progress.progress.percentage = 90
      
      // Paso 5: Clonar historial de versiones de prompts si está habilitado
      if (data.includePromptHistory) {
        progress.currentStep = 'Clonando historial de versiones de prompts...'
        progress.steps[4].status = 'processing'
        
        const promptVersions = await tx.promptVersion.findMany({
          where: { clientId: data.sourceClientId },
          orderBy: { timestamp: 'asc' }
        })
        
        progress.steps[4].itemsTotal = promptVersions.length
        progress.steps[4].itemsProcessed = 0
        
        for (const version of promptVersions) {
          await tx.promptVersion.create({
            data: {
              clientId: newClient.id,
              content: version.content,
              type: version.type,
              user: version.user,
              timestamp: version.timestamp // Mantener la fecha original para preservar el historial
            }
          })
          progress.steps[4].itemsProcessed!++
        }
        
        progress.steps[4].status = 'completed'
      } else {
        progress.steps[4].status = 'completed'
      }
      
      progress.progress.current = 100
      progress.progress.percentage = 100
      
      return {
        newClient,
        newSlug
      }
    }, {
      timeout: 60000 // 60 segundos de timeout
    })
    
    // Actualizar progreso final
    progress.status = 'completed'
    progress.currentStep = '¡Clonación completada exitosamente!'
    progress.result = {
      newClientId: result.newClient.id,
      newClientSlug: result.newSlug,
      newClientName: result.newClient.name
    }
    
    // Limpiar el job después de 5 minutos
    setTimeout(() => {
      cloneJobs.delete(jobId)
    }, 5 * 60 * 1000)
    
  } catch (error) {
    progress.status = 'failed'
    progress.error = error instanceof Error ? error.message : 'Error desconocido durante la clonación'
    
    // Limpiar el job fallido después de 5 minutos
    setTimeout(() => {
      cloneJobs.delete(jobId)
    }, 5 * 60 * 1000)
    
    throw error
  }
}

// Obtener progreso de clonación
export async function getCloneProgress(jobId: string): Promise<CloneProgress | null> {
  return cloneJobs.get(jobId) || null
}

// Limpiar trabajos antiguos (llamar periódicamente)
export function cleanupOldJobs() {
  const now = Date.now()
  const maxAge = 15 * 60 * 1000 // 15 minutos
  
  const entries = Array.from(cloneJobs.entries())
  for (const [jobId, progress] of entries) {
    if (progress.status === 'completed' || progress.status === 'failed') {
      // En producción, verificar timestamp de creación
      cloneJobs.delete(jobId)
    }
  }
}