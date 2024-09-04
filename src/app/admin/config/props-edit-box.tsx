import { Edit } from "lucide-react"
import { TokensPriceDialog } from "./(crud)/tokens-price-dialog"
import { NumberForm } from "@/components/number-form"
import { setMessageArrivedDelayAction, setSessionTTLAction, setTimezoneAction } from "./(crud)/actions"
import { TitleForm } from "@/components/title-form"

interface Props {
    clientId: string
    messageArrivedDelay: number
    sessionTTL: number
    timezone: string
}

export default function PropsEdit({ clientId, messageArrivedDelay, sessionTTL, timezone }: Props) {

    return (
        <div className="w-full p-4 border rounded-lg">
            <p className="text-lg font-bold">Propiedades del cliente:</p>
            <NumberForm clientId={clientId} label="Message Arrived Delay (seconds)" initialValue={messageArrivedDelay} update={setMessageArrivedDelayAction} />
            <NumberForm clientId={clientId} label="Session TTL (minutes)" initialValue={sessionTTL} update={setSessionTTLAction} />
            <div className="max-w-xs">
                <TitleForm id={clientId} initialValue={timezone} update={setTimezoneAction} label="Timezone" />
            </div>
        </div>
    )
}
