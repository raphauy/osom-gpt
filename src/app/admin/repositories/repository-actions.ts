"use server"
  
import { RepositoryDAO, createRepository, deleteRepository, getFullRepositoryDAO, setFinalMessage, setFunctionActive, setFunctionDescription, setFunctionName, setName, setNotifyExecution, setUILabel } from "@/services/repository-services"
import { revalidatePath } from "next/cache"


export async function getRepositoryDAOAction(id: string): Promise<RepositoryDAO | null> {
    return getFullRepositoryDAO(id)
}

export async function createRepositoryAction(name: string): Promise<RepositoryDAO | null> {       
    const created= await createRepository(name)

    revalidatePath("/admin/repositories")

    return created as RepositoryDAO
}

export async function deleteRepositoryAction(id: string): Promise<RepositoryDAO | null> {    
    const deleted= await deleteRepository(id)

    revalidatePath("/admin/repositories")

    return deleted as RepositoryDAO
}

export async function setNameAction(id: string, name: string): Promise<boolean> {
    const updated= await setName(id, name)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

export async function setUILabelAction(id: string, uiLabel: string): Promise<boolean> {
    const updated= await setUILabel(id, uiLabel)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

export async function setFunctionNameAction(id: string, functionName: string): Promise<boolean> {
    const updated= await setFunctionName(id, functionName)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

export async function setFunctionDescriptionAction(id: string, functionDescription: string): Promise<boolean> {
    const updated= await setFunctionDescription(id, functionDescription)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}   

export async function setFinalMessageAction(id: string, finalMessage: string): Promise<boolean> {
    const updated= await setFinalMessage(id, finalMessage)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

export async function setNotifyExecutionAction(id: string, notifyExecution: boolean): Promise<boolean> {
    const updated= await setNotifyExecution(id, notifyExecution)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

export async function setFunctionActiveAction(id: string, functionActive: boolean): Promise<boolean> {
    const updated= await setFunctionActive(id, functionActive)

    if (!updated) return false

    revalidatePath(`/admin/repositories/${updated.id}`)

    return true
}

