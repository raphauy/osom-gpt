import { DescriptionForm } from "@/components/description-form";
import { getValue } from "@/services/config-services";
import { getDocumentDAO } from "@/services/document-services";
import { redirect } from "next/navigation";
import { updateTemplateAction } from "../document-actions";
import { DocumentDialog } from "../document-dialogs";
import NovelOnClient from "./editor-on-client";
import GenerateDescriptionButton from "./generate-description-button";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Props = {
    params: {
        slug: string
        documentId: string
    }
}
export default async function Page({ params }: Props) {
    const slug= params.slug
    const documentId= params.documentId
    const document= await getDocumentDAO(documentId)
    if (!document) {
        return <div>Document not found</div>
    }
    let content= document.jsonContent
    if (!content) {
        content= JSON.stringify(defaultContent)
    }

    if (document.clientSlug !== slug) {
        redirect(`/client/${slug}/documents`)
    }

    const BASE_PATH= process.env.NEXTAUTH_URL

    const label= document.automaticDescription ? "generada con IA" : "manual"

    const descriptionTemplate= await getValue("DOCUMENT_DESCRIPTION_PROMPT")

    const currentUser= await getCurrentUser()
    //const isAllowed= currentUser?.email === "rapha.uy@rapha.uy" || currentUser?.email === "martiniano@osomdigital.com" || currentUser?.email === "gilberto@osomdigital.com"
    const isAdmin= currentUser?.role === "admin"

    return (
        <div className="flex flex-col w-full p-1 md:p-4 xl:p-8">
                        
            <div className="flex items-center justify-center gap-4 mb-4">
                <p className="text-3xl font-bold">{document.name}</p>
                <DocumentDialog id={document.id} clientId={document.clientId} />
            </div>

            <NovelOnClient document={document} initialContent={content} basePath={BASE_PATH || "http://localhost:3000"} />

            <div className={cn("gap-4 mt-10 space-y-5 mb-40")}>
                <p className="text-2xl font-bold">Descripción ({label})</p>
                <p className="whitespace-pre-wrap border rounded-md p-4">{document.description}</p>
                <GenerateDescriptionButton id={document.id} />

                <div className={cn(!isAdmin && "hidden")}>
                {
                    descriptionTemplate ?
                    <DescriptionForm 
                        id={"DOCUMENT_DESCRIPTION_PROMPT"} 
                        label="Descripción (este prompt se utiliza para generar la descripción automática para todos los clientes que estén en automático)"
                        initialValue={descriptionTemplate} 
                        update={updateTemplateAction} 
                    />
                    :
                    <p className="text-sm text-muted-foreground">No hay template de descripción</p>
                }
                </div>
                
            </div>                

        </div>
    )
}

const defaultContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Soy un título 2" }],
      },
      {
        type: "paragraph",
        content: [
            {
                type: "text",
                text: "Este es un editor al estilo de Notion con autocompletado impulsado por IA.",
            },
        ],
      },
      {
        type: "paragraph",
        content: [
            {
                type: "text",
                text: "Prueba digitando la barra diagonal / al inicio de un párrafo para ver las opciones de autocompletado. También puedes escribir ++ para que la IA te complete una frase.",
            },
        ],
      },   
    ],
  };