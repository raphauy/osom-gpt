import { getClientBySlug } from "@/services/clientService"
import { PromptForm } from "@/app/admin/prompts/prompt-form"
import { updatePromptAndCreateVersionAction } from "@/app/admin/clients/(crud)/actions"
import PromptVersionManager from "./prompt-version-manager"
import { getPromptVersionsDAO } from "@/services/prompt-version-services"

type Props= {
    params: {
      slug: string
    }
}  
export default async function PromptPage({ params }: Props) {
    const slug= params.slug
        
    const client= await getClientBySlug(slug)
    if (!client) {
      return <div>Cliente no encontrado</div>
    }

    const versions= await getPromptVersionsDAO(client.id)

    return <PromptVersionManager clientId={client.id} prompt={client.prompt || ""} versions={versions} timezone={client.timezone}/>
}
