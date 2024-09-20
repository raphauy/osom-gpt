import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WebhookStatus } from "@prisma/client"
import { CheckCircle, RefreshCcw, XCircle } from "lucide-react"

interface WebhookCardProps {
  functionName: string
  status: WebhookStatus
  phone: string
  webhookUrl: string
  clientName: string
  duration: number
}

export default function WebhookCard({ functionName, status, phone, webhookUrl, clientName, duration }: WebhookCardProps) {
  const StatusIcon = status === "success" ? CheckCircle : status === "error" ? XCircle : RefreshCcw
  const statusColor = status === "success" ? "text-green-500" : status === "error" ? "text-red-500" : "text-yellow-500"

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center min-w-[300px] border-b border-gray-200 pb-2">
            <div className="w-8">
              <StatusIcon className={`h-6 w-6 ${statusColor}`} />
            </div>
            <span>{functionName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[70px_1fr] gap-2">
          <div className="font-semibold">Cliente:</div>
          <div>{clientName}</div>
          
          <div className="font-semibold">Teléfono:</div>
          <div>{phone}</div>
          
          <div className="font-semibold">Webhook:</div>
          <div className="break-all">{webhookUrl}</div>

          { duration !== -1 && (
            <>
              <div className="font-semibold">Duración:</div>
              <div>{(duration/1000).toFixed(2)} seg.</div>
            </>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}