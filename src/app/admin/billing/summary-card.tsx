import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, TrendingUp } from "lucide-react";

type SummaryCardProps = {
    chatCost: number
    apiCost: number
    costIcon: boolean  // true = compra, false = venta
    isClientView?: boolean
    chatSellCost?: number  // Para calcular ganancia en vista admin
    apiSellCost?: number   // Para calcular ganancia en vista admin
}

export default function SummaryCard({ 
    chatCost, 
    apiCost, 
    costIcon, 
    isClientView = false,
    chatSellCost = 0,
    apiSellCost = 0
}: SummaryCardProps) {
    
    const totalCost = chatCost + apiCost
    const totalSellCost = chatSellCost + apiSellCost
    const totalProfit = totalSellCost - totalCost

    return (
        <Card className={cn("flex flex-col", totalCost === 0 && "opacity-20")}>
            <CardHeader>
                <CardDescription>
                    <div className="flex justify-between items-center">
                        {isClientView ? (
                            <>
                                <span>Resumen Total</span>
                                <CircleDollarSign />
                            </>
                        ) : (
                            <>
                                {costIcon ? <span>Total de Compra</span> : <span>Total de Venta</span>}
                                {costIcon ? <ArrowDownCircle /> : <ArrowUpCircle />}
                            </>
                        )}
                    </div>
                </CardDescription>
                <CardTitle>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(totalCost)}</p>
                        {!isClientView && !costIcon && totalProfit > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-green-600 font-medium">
                                    +{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(totalProfit)}
                                </p>
                                <p className="text-xs text-muted-foreground">Ganancia</p>
                            </div>
                        )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardHeader>
                <CardTitle>
                    <div className="grid grid-cols-2 gap-4 text-lg">
                        <div className="text-center">
                            <p className="text-muted-foreground">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(chatCost)}</p>
                            <p className="text-sm text-muted-foreground">Conversaciones</p>
                        </div>
                        <div className="text-center">
                            <p className="text-muted-foreground">{Intl.NumberFormat("es-UY", { style: "currency", currency: "USD" }).format(apiCost)}</p>
                            <p className="text-sm text-muted-foreground">APIs</p>
                        </div>
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="flex justify-between">
                        <span>Resumen del período</span>
                        {!isClientView && (
                            <span className="text-xs">
                                {costIcon ? "Costos" : "Ingresos"}
                            </span>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
} 