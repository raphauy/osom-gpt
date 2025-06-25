import { Edit } from "lucide-react"
import { TokensPriceDialog } from "./(crud)/tokens-price-dialog"
import { ApiTokensPriceDialog } from "./(crud)/api-tokens-price-dialog"

interface Props {
    clientId: string
    promptTokensPrice: number | null | undefined
    completionTokensPrice: number | null | undefined
    imagePromptTokensPrice?: number | null | undefined
    imageCompletionTokensPrice?: number | null | undefined
    audioSecondsPrice?: number | null | undefined
    embeddingTokensPrice?: number | null | undefined
}

export default function TokensPrice({ 
    clientId, 
    promptTokensPrice, 
    completionTokensPrice,
    imagePromptTokensPrice = 0,
    imageCompletionTokensPrice = 0,
    audioSecondsPrice = 0,
    embeddingTokensPrice = 0
}: Props) {

    const editChatTrigger = (<Edit size={30} className="pr-2 hover:cursor-pointer"/>)
    const editApiTrigger = (<Edit size={30} className="pr-2 hover:cursor-pointer"/>)

    const formatPrice = (price: number | null | undefined) => {
        return price ? Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", minimumFractionDigits: 3, maximumFractionDigits:3 }).format(price) : "N/D"
    }

    return (
        <div className="w-full p-4 border rounded-lg">
            {/* Chat Tokens Pricing */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">Precio de tokens (Chat)</p>
                    <TokensPriceDialog title="Editar precios de tokens de chat" trigger={editChatTrigger} id={clientId} />
                </div>
                <div className="flex items-end gap-4">
                    <p className="mt-5"><strong>Prompt Tokens Price:</strong> {formatPrice(promptTokensPrice)}</p>
                </div>
                <div className="flex items-end gap-4 pb-3 mb-3">
                    <p className="mt-5"><strong>Completion Tokens Price:</strong> {formatPrice(completionTokensPrice)}</p>
                </div>
            </div>

            {/* API Tokens Pricing */}
            <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">Precio de tokens (APIs)</p>
                    <ApiTokensPriceDialog title="Editar precios de tokens de APIs" trigger={editApiTrigger} id={clientId} />
                </div>
                
                <div className="mt-4">
                    <p className="text-lg font-medium">API de Imágenes</p>
                    <div className="flex items-end gap-4">
                        <p className="mt-2"><strong>Prompt Tokens:</strong> {formatPrice(imagePromptTokensPrice)}</p>
                    </div>
                    <div className="flex items-end gap-4 pb-3">
                        <p className="mt-2"><strong>Completion Tokens:</strong> {formatPrice(imageCompletionTokensPrice)}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <p className="text-lg font-medium">API de Audio</p>
                    <div className="flex items-end gap-4 pb-3">
                        <p className="mt-2"><strong>Precio por Segundo:</strong> {formatPrice(audioSecondsPrice)}</p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <p className="text-lg font-medium">API de Embeddings</p>
                    <div className="flex items-end gap-4 pb-3">
                        <p className="mt-2"><strong>Precio por Token:</strong> {formatPrice(embeddingTokensPrice)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
