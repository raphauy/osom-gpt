import { Edit } from "lucide-react"
import { TokensPriceDialog } from "./(crud)/tokens-price-dialog"
import { NumberForm } from "@/components/number-form"
import { setMessageArrivedDelayAction, setSessionTTLAction } from "./(crud)/actions"

interface Props {
    clientId: string
    messageArrivedDelay: number
    sessionTTL: number
}

export default function PropsEdit({ clientId, messageArrivedDelay, sessionTTL }: Props) {

    return (
        <div className="w-full p-4 border rounded-lg">
            <p className="text-lg font-bold">Propiedades del cliente:</p>
            <NumberForm clientId={clientId} label="Message Arrived Delay" initialValue={messageArrivedDelay} update={setMessageArrivedDelayAction} />
            <NumberForm clientId={clientId} label="Session TTL" initialValue={sessionTTL} update={setSessionTTLAction} />
        </div>
    )
}
