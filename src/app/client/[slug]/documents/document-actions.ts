"use server"
  
import { revalidatePath } from "next/cache"
import { DocumentDAO, DocumentFormValues, createDocument, updateDocument, getFullDocumentDAO, deleteDocument, updateContent, generateDescription } from "@/services/document-services"
import { setValue } from "@/services/config-services"


export async function getDocumentDAOAction(id: string): Promise<DocumentDAO | null> {
    return getFullDocumentDAO(id)
}

export async function createOrUpdateDocumentAction(id: string | null, data: DocumentFormValues): Promise<DocumentDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateDocument(id, data)
    } else {
        updated= await createDocument(data)
        // const BASE_PATH= process.env.NEXTAUTH_URL
        // const url= `${BASE_PATH}/d/${updated.id}`
        // data.url= url
        // updated= await updateDocument(updated.id, data)
    }     

    revalidatePath("/client/[slug]/documents", 'page')

    return updated as DocumentDAO
}

export async function deleteDocumentAction(id: string): Promise<DocumentDAO | null> {    
    const deleted= await deleteDocument(id)

    revalidatePath("/client/[slug]/documents", 'page')

    return deleted as DocumentDAO
}

export async function updateContentAction(id: string, textContent: string, jsonContent: string): Promise<DocumentDAO | null> {
    
    const updated= await updateContent(id, textContent, jsonContent)

    revalidatePath("/client/[slug]/documents", 'page')
  
    return updated as DocumentDAO
}
  

export async function generateDescriptionAction(id: string, template?: string): Promise<boolean> {
    
    const res= await generateDescription(id, template)

    revalidatePath("/client/[slug]/documents", 'page')
  
    return res
}

export async function updateTemplateAction(id: string, template: string): Promise<boolean> {
    const res= await setValue(id, template)

    revalidatePath("/client/[slug]/documents", 'page')
  
    if (!res) return false

    return true
}