"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { resendWebhookNotificationAction } from "./webhooknotification-actions"
import { toast } from "@/components/ui/use-toast"
import { Loader, Play } from "lucide-react"

type ResendWebhookButtonProps = {
    id: string
}
export default function ResendWebhookButton({id}: ResendWebhookButtonProps) {
    const [loading, setLoading] = useState(false)

    function handleClick() {
        setLoading(true)
        resendWebhookNotificationAction(id)
        .then(() => {
            toast({ title: "Webhook invocado nuevamente" })
        })
        .catch((error) => {
            toast({ title: "Error al invocar webhook", description: error.message, variant: "destructive" })
        })
        .finally(() => {
            setLoading(false)
        })
    }
    return (
        <Button onClick={handleClick} variant="ghost">
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Reintentar
        </Button>
    )
}