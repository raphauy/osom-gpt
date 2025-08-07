"use server"

import { revalidatePath } from "next/cache"
import getSession from "@/lib/auth"
import { 
  cloneClient, 
  getClonePreview as getPreview, 
  getCloneProgress as getProgress,
  getSuggestedCloneName,
  type CloneClientData 
} from "@/services/client-cloning-service"

export async function initiateClone(data: CloneClientData) {
  const session = await getSession()
  
  if (!session || session.user?.role !== "admin") {
    throw new Error("No autorizado. Solo administradores pueden clonar clientes.")
  }
  
  try {
    const result = await cloneClient(data)
    
    // La revalidación se hace cuando se completa en getCloneProgress
    
    return result
  } catch (error) {
    console.error("Error al iniciar clonación:", error)
    throw new Error(error instanceof Error ? error.message : "Error al clonar cliente")
  }
}

export async function getClonePreview(sourceClientId: string) {
  const session = await getSession()
  
  if (!session || session.user?.role !== "admin") {
    throw new Error("No autorizado. Solo administradores pueden clonar clientes.")
  }
  
  try {
    const preview = await getPreview(sourceClientId)
    return preview
  } catch (error) {
    console.error("Error al obtener preview:", error)
    throw new Error(error instanceof Error ? error.message : "Error al obtener vista previa")
  }
}

export async function getCloneProgress(jobId: string) {
  const session = await getSession()
  
  if (!session || session.user?.role !== "admin") {
    throw new Error("No autorizado. Solo administradores pueden clonar clientes.")
  }
  
  try {
    const progress = await getProgress(jobId)
    
    if (!progress) {
      throw new Error("Trabajo de clonación no encontrado")
    }
    
    // Si la clonación se completó exitosamente, revalidar
    if (progress.status === 'completed') {
      revalidatePath("/admin/clients")
    }
    
    return progress
  } catch (error) {
    console.error("Error al obtener progreso:", error)
    throw new Error(error instanceof Error ? error.message : "Error al obtener progreso")
  }
}

export async function getSuggestedName(sourceName: string) {
  const session = await getSession()
  
  if (!session || session.user?.role !== "admin") {
    throw new Error("No autorizado. Solo administradores pueden clonar clientes.")
  }
  
  try {
    const suggestedName = await getSuggestedCloneName(sourceName)
    return suggestedName
  } catch (error) {
    console.error("Error al obtener nombre sugerido:", error)
    throw new Error(error instanceof Error ? error.message : "Error al obtener nombre sugerido")
  }
}