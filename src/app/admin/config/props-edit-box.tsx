import { Edit } from "lucide-react"
import { TokensPriceDialog } from "./(crud)/tokens-price-dialog"
import { NumberForm } from "@/components/number-form"
import { setMessageArrivedDelayAction } from "./(crud)/actions"

interface Props {
    clientId: string
    messageArrivedDelay: number
}

export default function PropsEdit({ clientId, messageArrivedDelay }: Props) {

    return (
        <div className="w-full p-4 border rounded-lg">
            <p className="text-lg font-bold">Propiedades del cliente:</p>
            <NumberForm clientId={clientId} label="Message Arrived Delay" initialValue={messageArrivedDelay} update={setMessageArrivedDelayAction} />
        </div>
    )
}
