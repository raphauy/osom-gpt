"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart, RadialBar, RadialBarChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { IndicatorResult } from "@/services/analytics-service"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getMonthName, getMonthNamePlusOne } from "@/lib/utils"

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
  client6: {
    label: "client6",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig

type Props= {
    indicator: IndicatorResult
    clientName?: string | null
}

export function SixMonthChart({ indicator, clientName }: Props) {
    const searchParams= useSearchParams()
    const [last, setLast] = useState(searchParams.get("last"))
    const [from, setFrom] = useState(searchParams.get("from"))
    const [to, setTo] = useState(searchParams.get("to"))
  
    useEffect(() => {
      setLast(searchParams.get("last"))
      setFrom(searchParams.get("from"))
      setTo(searchParams.get("to"))
    }, [searchParams])

    const lastLabel= 
      last === "HOY" ? "hoy" :
      last === "7D" ? "Últimos 7 días" : 
      last === "30D" ? "Últimos 30 días" : 
      last === "LAST_MONTH" ? "Mes pasado" :
      from && to && from.slice(0, 7) === to.slice(0, 7) ? getMonthName(from.slice(5, 7)) : 
      from && to ? + from + " al " + to : 
      "Últimos 6 meses"

    const top= 6
    const data= indicator.data.slice(0, top)

    const chartData= data.map((item, index) => ({ label: getMonthName(item.label), total: item.total, fill: `var(--color-client${index % 6 + 1})` }))
//    const chartData= data.map((item, index) => ({ label: getMonthNamePlusOne(item.label), total: item.total, fill: `var(--color-client${index % 6 + 1})` }))

    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Gráfico mensual</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="total" hideLabel />}
              />
              <Pie data={chartData} dataKey="total" outerRadius={160}>
                <LabelList
                  dataKey="label"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
            {lastLabel} {clientName && `(${clientName})`}
            </div>
        </CardFooter>
      </Card>
    )
  }
  