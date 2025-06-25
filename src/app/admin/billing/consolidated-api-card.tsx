import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, Zap } from "lucide-react";
import { ApiUsageData } from "./actions";

type ConsolidatedApiCardProps = {
    apiUsageData: ApiUsageData[]
    costIcon: boolean  // true = compra (costo OpenAI), false = venta (precio cliente)
    isClientView?: boolean  // Para vista de cliente (solo muestra precios)
}

export default function ConsolidatedApiCard({ apiUsageData, costIcon, isClientView = false }: ConsolidatedApiCardProps) {
    
    // Consolidar todos los datos de las APIs
    const consolidatedData = apiUsageData.reduce((acc, api) => {
        const serviceCost = costIcon ? api.totalOpenAICost : api.totalCost
        acc.totalCost += serviceCost

        // Acumular métricas por tipo de servicio
        if (api.serviceType === "image") {
            acc.imageTokens += api.totalUsage
            acc.imageCost += serviceCost
        } else if (api.serviceType === "audio") {
            acc.audioSeconds += api.totalUsage
            acc.audioCost += serviceCost
        } else if (api.serviceType === "embedding") {
            acc.embeddingTokens += api.totalUsage
            acc.embeddingCost += serviceCost
        }

        return acc
    }, {
        totalCost: 0,
        imageTokens: 0,
        audioSeconds: 0,
        embeddingTokens: 0,
        imageCost: 0,
        audioCost: 0,
        embeddingCost: 0
    })

    const hasUsage = consolidatedData.totalCost > 0

    return (
        <Card className={cn("flex flex-col", !hasUsage && "opacity-20")}>
            <CardHeader>
                <CardDescription>
                    <div className="flex justify-between items-center">
                        {isClientView ? (
                            <>
                                <span>APIs Totales</span>
                                <CircleDollarSign />
                            </>
                        ) : (
                            <>
                                {costIcon ? <span>Total de Compra APIs</span> : <span>Total de Venta APIs</span>}
                                {costIcon ? <ArrowDownCircle /> : <ArrowUpCircle />}
                            </>
                        )}
                    </div>
                </CardDescription>
                <CardTitle>
                    <div className="flex items-center justify-between">
                        <p>{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(consolidatedData.totalCost)}</p>
                        <Zap className="w-5 h-5 text-green-600" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardHeader>
                <CardTitle>
                    {/* Header de columnas */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold border-b pb-1 mb-2">
                        <span className="text-muted-foreground">Servicio</span>
                        <span className="text-muted-foreground text-center">Uso</span>
                        <span className="text-muted-foreground text-right">Costo</span>
                    </div>
                    
                    {/* Filas de datos */}
                    <div className="grid grid-cols-1 gap-1 text-sm">
                        {consolidatedData.imageTokens > 0 && (
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-muted-foreground">Imágenes</span>
                                <span className="text-muted-foreground text-center">{Intl.NumberFormat("es-UY").format(consolidatedData.imageTokens)} tokens</span>
                                <span className="text-muted-foreground text-right font-medium">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(consolidatedData.imageCost)}</span>
                            </div>
                        )}
                        {consolidatedData.audioSeconds > 0 && (
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-muted-foreground">Audio</span>
                                <span className="text-muted-foreground text-center">{consolidatedData.audioSeconds.toFixed(1)}s</span>
                                <span className="text-muted-foreground text-right font-medium">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(consolidatedData.audioCost)}</span>
                            </div>
                        )}
                        {consolidatedData.embeddingTokens > 0 && (
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-muted-foreground">Embeddings</span>
                                <span className="text-muted-foreground text-center">{Intl.NumberFormat("es-UY").format(consolidatedData.embeddingTokens)} tokens</span>
                                <span className="text-muted-foreground text-right font-medium">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(consolidatedData.embeddingCost)}</span>
                            </div>
                        )}
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="flex justify-between">
                        <span>Servicios de IA</span>
                        {!isClientView && (
                            <span className="text-xs">
                                {costIcon ? "Costo OpenAI" : "Precio Cliente"}
                            </span>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
} 