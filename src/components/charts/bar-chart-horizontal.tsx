"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { IndicatorResult } from "@/services/analytics-service"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { formatNumberWithThousandsSeparator, getMonthName } from "@/lib/utils"

const chartConfig = {
  label: {
    label: "Clientes",
    color: "hsl(var(--chart-1))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type Props= {
    indicator: IndicatorResult
}
export function BarChartHorizontal({ indicator }: Props) {
    const searchParams= useSearchParams()
    const [last, setLast] = useState(searchParams.get("last"))
    const [from, setFrom] = useState(searchParams.get("from"))
    const [to, setTo] = useState(searchParams.get("to"))
  
    useEffect(() => {
      setLast(searchParams.get("last"))
      setFrom(searchParams.get("from"))
      setTo(searchParams.get("to"))
    }, [searchParams])

    const lastLabel= last === "HOY" ? "hoy" : last === "7D" ? "últimos 7 días" : last === "30D" ? "últimos 30 días" : from && to && from.slice(0, 7) === to.slice(0, 7) ? getMonthName(from.slice(5, 7)) : from && to ? "del " + from + " al " + to : last === "LAST_MONTH" ? "mes pasado" : "toda la base de datos"

    const top= 10
    const data= indicator.data.slice(0, top)

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-2xl">
                        {indicator.name} por cliente
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{formatNumberWithThousandsSeparator(indicator.total)}</p>
                    </div>
                </CardTitle>
                <CardDescription>Top {top} clientes - {lastLabel}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={data}
                        layout="vertical"
                        margin={{
                            right: 16,
                            left: 150,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="label"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            hide
                        />
                        <XAxis dataKey="total" type="number" hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <Bar
                            dataKey="total"
                            layout="vertical"
                            fill="var(--color-label)"
                            radius={4}
                        >
                        <LabelList
                            dataKey="label"
                            position="left"
                            offset={8}
                            className="fill-[--color-label]"
                            fontSize={14}     
                        />
                        <LabelList
                            dataKey="total"
                            position="right"
                            offset={8}
                            className="fill-foreground"
                            fontSize={12}                            
                        />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                Showing total visitors for the last 6 months
                </div>
            </CardFooter> */}
        </Card>
    )
}
