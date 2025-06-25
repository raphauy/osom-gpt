import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Image, Mic, Hash } from "lucide-react";
import { ApiUsageData } from "./actions";

type ApiUsageCardProps = {
    apiUsageData: ApiUsageData
    showCosts?: boolean  // Para mostrar costos de compra (admin panel)
}

export default function ApiUsageCard({ apiUsageData, showCosts = false }: ApiUsageCardProps) {
    const { serviceType, totalUsage, totalCost, totalOpenAICost, clientName } = apiUsageData

    // Determine icon and labels based on service type
    const getServiceInfo = () => {
        switch (serviceType) {
            case "image":
                return {
                    icon: <Image className="w-5 h-5" aria-label="API de imágenes" />,
                    label: "API de Imágenes",
                    usageLabel: "Total Tokens",
                    usageFormat: (usage: number) => Intl.NumberFormat("es-UY").format(usage)
                }
            case "audio":
                return {
                    icon: <Mic className="w-5 h-5" aria-label="API de audio" />,
                    label: "API de Audio",
                    usageLabel: "Segundos Procesados",
                    usageFormat: (usage: number) => `${usage.toFixed(2)}s`
                }
            case "embedding":
                return {
                    icon: <Hash className="w-5 h-5" aria-label="API de embeddings" />,
                    label: "API de Embeddings",
                    usageLabel: "Total Tokens",
                    usageFormat: (usage: number) => Intl.NumberFormat("es-UY").format(usage)
                }
            default:
                return {
                    icon: <Hash className="w-5 h-5" aria-label="API genérica" />,
                    label: "API",
                    usageLabel: "Uso Total",
                    usageFormat: (usage: number) => usage.toString()
                }
        }
    }

    const serviceInfo = getServiceInfo()
    const profit = totalCost - totalOpenAICost

    return (
        <Card className={cn("flex flex-col", totalCost === 0 && "opacity-20")}>
            <CardHeader>
                <CardDescription>
                    <div className="flex justify-between items-center">
                        <span>{serviceInfo.label}</span>
                        {serviceInfo.icon}
                    </div>
                </CardDescription>
                <CardTitle>
                    <div className="flex items-center justify-between">
                        <p>{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(totalCost)}</p>
                        {showCosts && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                    Ganancia: {Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(profit)}
                                </p>
                            </div>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center justify-between">
                        <p className="text-lg text-muted-foreground">{serviceInfo.usageFormat(totalUsage)}</p>
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="flex justify-between">
                        <p>{serviceInfo.usageLabel}</p>
                        {showCosts && (
                            <p className="text-sm">
                                Costo OpenAI: {Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(totalOpenAICost)}
                            </p>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
} 