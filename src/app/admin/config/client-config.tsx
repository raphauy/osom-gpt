
import { DataClient, getDataClient } from "../clients/(crud)/actions"
import Hook from "./hook"
import TokensPrice from "./tokens-price"

type Props = {
    client: DataClient
}
export default async function ClientConfig({ client }: Props) {

    const BASE_PATH= process.env.NEXTAUTH_URL || "NOT-CONFIGURED"

    return (
        <div className="w-full mt-10 space-y-5 ">
            <div className="w-full space-y-7">
                <Hook basePath={BASE_PATH} />
                <TokensPrice 
                    clientId={client.id} 
                    promptTokensPrice={client.promptTokensPrice} 
                    completionTokensPrice={client.completionTokensPrice}
                    imagePromptTokensPrice={client.imagePromptTokensPrice}
                    imageCompletionTokensPrice={client.imageCompletionTokensPrice}
                    audioSecondsPrice={client.audioSecondsPrice}
                    embeddingTokensPrice={client.embeddingTokensPrice}
                />
            </div>
        </div>
    )
}
