"use server"
  
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { DocumentDAO, DocumentFormValues, createDocument, updateDocument, getFullDocumentDAO, deleteDocument, updateContent } from "@/services/document-services"


export async function getDocumentDAOAction(id: string): Promise<DocumentDAO | null> {
    return getFullDocumentDAO(id)
}

export async function createOrUpdateDocumentAction(id: string | null, data: DocumentFormValues): Promise<DocumentDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateDocument(id, data)
    } else {
        updated= await createDocument(data)
    }     

    revalidatePath("/[slug]/documents")

    return updated as DocumentDAO
}

export async function deleteDocumentAction(id: string): Promise<DocumentDAO | null> {    
    const deleted= await deleteDocument(id)

    revalidatePath("/[slug]/documents")

    return deleted as DocumentDAO
}

export async function updateContentAction(id: string, textContent: string, jsonContent: string): Promise<DocumentDAO | null> {
    
    const updated= await updateContent(id, textContent, jsonContent)

    revalidatePath("/[slug]/documents")
  
    return updated as DocumentDAO
}
  