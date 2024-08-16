"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { IndicatorResult } from "@/services/analytics-service"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getMonthName } from "@/lib/utils"

const chartConfig = {
  total: {
    label: "total",
  },
  client1: {
    label: "client1",
    color: "hsl(var(--chart-1))",
  },
  client2: {
    label: "client2",
    color: "hsl(var(--chart-2))",
  },
  client3: {
    label: "client3",
    color: "hsl(var(--chart-3))",
  },
  client4: {
    label: "client4",
    color: "hsl(var(--chart-4))",
  },
  client5: {
    label: "client5",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

type Props= {
    indicator: IndicatorResult
    clientName?: string | null
}

export function RadialChart({ indicator, clientName }: Props) {  
    const searchParams= useSearchParams()
    const [last, setLast] = useState(searchParams.get("last"))
    const [from, setFrom] = useState(searchParams.get("from"))
    const [to, setTo] = useState(searchParams.get("to"))
  
    useEffect(() => {
      setLast(searchParams.get("last"))
      setFrom(searchParams.get("from"))
      setTo(searchParams.get("to"))
    }, [searchParams])

    if (clientName) return null

    const lastLabel= last === "HOY" ? "hoy" : last === "7D" ? "últimos 7 días" : last === "30D" ? "últimos 30 días" : from && to && from.slice(0, 7) === to.slice(0, 7) ? getMonthName(from.slice(5, 7)) : from && to ? from + " al " + to : "toda la base de datos"

    const top= 5
    const data= indicator.data.slice(0, top)

    const chartData= data.map((item, index) => ({ label: item.label, total: item.total, fill: `var(--color-client${index % 5 + 1})` }))

    return (
        <Card className="flex flex-col w-full h-full mt-0 pt-0">
        <CardHeader className="items-center pb-0">
            <CardTitle>Top 5 clientes en {indicator.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
            <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px]"
            >
            <RadialBarChart
                data={chartData}
                startAngle={-90}
                endAngle={380}
                innerRadius={45}
                outerRadius={200}
            >
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="label" />}
                />
                <RadialBar dataKey="total" background>
                <LabelList
                    position="insideStart"
                    dataKey="label"
                    className="fill-white capitalize mix-blend-luminosity"
                    fontSize={14}
                />
                </RadialBar>
            </RadialBarChart>
            </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
            Mostrando datos de {lastLabel}
            </div>
        </CardFooter>
        </Card>
    )
}
