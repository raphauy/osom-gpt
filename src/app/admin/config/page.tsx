
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientSelector, SelectorData } from "../client-selector"
import { getDataClients, updatePromptAndCreateVersionAction } from "../clients/(crud)/actions"
import { ClientFunctionsBox } from "../clients/(crud)/client-dialog"
import ConfigsPage from "../configs/page"
import { PromptForm } from "../prompts/prompt-form"
import Hook from "./hook"
import TokensPrice from "./tokens-price"
import CopyHook from "./copy-hook"
import { getClientBySlug, getFunctionsOfClient, getMessageArrivedDelay, getSessionTTL } from "@/services/clientService"
import DocumentsHook from "./documents-hook"
import PropsEdit from "./props-edit-box"
import { setMessageArrivedDelayAction } from "./(crud)/actions"
import PromptVersionManager from "@/app/client/[slug]/prompt/prompt-version-manager"
import { getPromptVersionsDAO } from "@/services/prompt-version-services"
import AttachHooks from "./attach-hooks"
import SpecialHooks from "./special-hooks"

type Props = {
    searchParams: {
        clientId: string
    }
}
export default async function ConfigPage({ searchParams }: Props) {

    const clientId= searchParams.clientId

    const clients= await getDataClients()
    const client= clients.find((client) => client.id === clientId)

    if (!client) return <div>No hay clientes</div>
    const selectors: SelectorData[]= clients.map((client) => ({ slug: client.id, name: client.nombre }))
    const narvaezClient= await getClientBySlug("narvaez")
    const summitClient= await getClientBySlug("summit")
    const functionsOfClient= await getFunctionsOfClient(clientId)
    const haveCarServiceFunction= functionsOfClient.find((f) => f.name === "reservarServicio") !== undefined
    const haveRegistrarPedidoFunction= functionsOfClient.find((f) => f.name === "registrarPedido") !== undefined

    const BASE_PATH= process.env.NEXTAUTH_URL || "NOT-CONFIGURED"

    const messageArrivedDelay= await getMessageArrivedDelay(clientId)
    const sessionTTL= await getSessionTTL(clientId)
    const versions= await getPromptVersionsDAO(clientId)

    return (
        <div className="flex flex-col items-center w-full p-5 gap-7">
            <Tabs defaultValue="prompt" className="min-w-[700px] xl:min-w-[1000px] h-full">
                <TabsList className="flex justify-between w-full h-12 mb-8">
                    <ClientSelector selectors={selectors} />
                    <div>
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                        <TabsTrigger value="functions">Funciones</TabsTrigger>
                        <TabsTrigger value="props">Props</TabsTrigger>
                        <TabsTrigger value="hooks">Hooks</TabsTrigger>                        
                        <TabsTrigger value="general">General</TabsTrigger>
                    </div>
                </TabsList>
                <TabsContent value="prompt" className="h-full">
                    <PromptVersionManager clientId={client.id} prompt={client.prompt || ""} versions={versions} timezone={client.timezone}/>    
                </TabsContent>
                <TabsContent value="functions">
                    <ClientFunctionsBox clientId={client.id} />
                </TabsContent>
                <TabsContent value="props" className="space-y-2">
                    <PropsEdit clientId={client.id} messageArrivedDelay={messageArrivedDelay || 8} sessionTTL={sessionTTL || 10} timezone={client.timezone} />
                    <TokensPrice clientId={client.id} promptTokensPrice={client.promptTokensPrice} completionTokensPrice={client.completionTokensPrice} imagePromptTokensPrice={client.imagePromptTokensPrice} imageCompletionTokensPrice={client.imageCompletionTokensPrice} audioSecondsPrice={client.audioSecondsPrice} embeddingTokensPrice={client.embeddingTokensPrice} />
                </TabsContent>
                <TabsContent value="hooks">
                    <Hook basePath={BASE_PATH} />
                    <DocumentsHook basePath={BASE_PATH} />
                    <AttachHooks basePath={BASE_PATH} />
                    <SpecialHooks basePath={BASE_PATH} />
                    <CopyHook name="Narvaez Entry" path={`${BASE_PATH}/api/${narvaezClient?.id}/narvaez`} clientId={narvaezClient?.id || ""} />
                    <CopyHook name="Summit Entry" path={`${BASE_PATH}/api/${summitClient?.id}/summit`} clientId={summitClient?.id || ""} />
                    { haveCarServiceFunction && 
                        <CopyHook name="Car Service Entry" path={`${BASE_PATH}/api/${client.id}/car-service`} clientId={client.id} />
                    }
                    { haveRegistrarPedidoFunction && 
                        <CopyHook name="Obtener Registros (Narvaez)" path={`${BASE_PATH}/api/${client.id}/registros`} clientId={client.id} />
                    }
                </TabsContent>
                <TabsContent value="general">
                    <ConfigsPage />
                </TabsContent>
            </Tabs>    

        </div>
    )
}
