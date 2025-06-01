import { getClientBySlug } from "@/services/clientService"
import { getPromptVersionsDAO, getImagePromptVersionsDAO } from "@/services/prompt-version-services"
import PromptVersionManager from "./prompt-version-manager"
import ImagePromptVersionManager from "./image-prompt-version-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

    const textVersions= await getPromptVersionsDAO(client.id)
    const imageVersions= await getImagePromptVersionsDAO(client.id)

    return (
        <div className="w-full h-full">
            <Tabs defaultValue="text" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Prompt de Texto</TabsTrigger>
                    <TabsTrigger value="image">Prompt de Imagen</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="h-full">
                    <PromptVersionManager 
                        clientId={client.id} 
                        prompt={client.prompt || ""} 
                        versions={textVersions} 
                        timezone={client.timezone}
                    />
                </TabsContent>
                <TabsContent value="image" className="h-full">
                    <ImagePromptVersionManager 
                        clientId={client.id} 
                        imagePrompt={client.imagePrompt || ""} 
                        versions={imageVersions} 
                        timezone={client.timezone}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
