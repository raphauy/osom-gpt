"use server"
  
import { revalidatePath } from "next/cache"
import { PromptVersionDAO, PromptVersionFormValues, createPromptVersion, updatePromptVersion, deletePromptVersion, getPromptVersionDAO, ImagePromptVersionDAO, ImagePromptVersionFormValues, createImagePromptVersion, getImagePromptVersionsDAO } from "@/services/prompt-version-services"


export async function getPromptVersionDAOAction(id: string): Promise<PromptVersionDAO | null> {
    return getPromptVersionDAO(id)
}

export async function createOrUpdatePromptVersionAction(id: string | null, data: PromptVersionFormValues): Promise<PromptVersionDAO | null> {       
    let updated= null
    if (id) {
        updated= await updatePromptVersion(id, data)
    } else {
        updated= await createPromptVersion(data)
    }     

    revalidatePath("/admin/promptVersions")
    revalidatePath("/client/[slug]/prompt", "page")

    return updated as PromptVersionDAO
}

export async function createOrUpdateImagePromptVersionAction(id: string | null, data: ImagePromptVersionFormValues): Promise<ImagePromptVersionDAO | null> {       
    let updated= null
    if (id) {
        // Para imagen prompts, por ahora solo soportamos creación
        updated= await createImagePromptVersion(data)
    } else {
        updated= await createImagePromptVersion(data)
    }     

    revalidatePath("/admin/promptVersions")
    revalidatePath("/client/[slug]/prompt", "page")

    return updated as ImagePromptVersionDAO
}

export async function deletePromptVersionAction(id: string): Promise<PromptVersionDAO | null> {    
    const deleted= await deletePromptVersion(id)

    revalidatePath("/admin/promptVersions")
    revalidatePath("/client/[slug]/prompt", "page")

    return deleted as PromptVersionDAO
}

