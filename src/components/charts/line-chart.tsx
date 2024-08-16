"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { IndicatorResult } from "@/services/analytics-service"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "../ui/badge"
import { getMonthName } from "@/lib/utils"
import { getClientNameAction } from "@/app/analytics/actions"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
  label: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type Props= {
  indicator: IndicatorResult
}
export function LineChartComponent({ indicator }: Props) {
  const [activeChart, setActiveChart] =
    useState<keyof typeof chartConfig>("total")

  const total = useMemo(
    () => ({
      label: indicator.data.reduce((acc, curr) => acc + curr.total, 0),
    }),
    [indicator]
  )

  const searchParams= useSearchParams()
  const [last, setLast] = useState(searchParams.get("last"))
  const [from, setFrom] = useState(searchParams.get("from"))
  const [to, setTo] = useState(searchParams.get("to"))

  const clientId= searchParams.get("cId")
  const [clientName, setClientName] = useState("")

  useEffect(() => {
    if (!clientId) return

    getClientNameAction(clientId)
    .then(clientName => {
      if (clientName) {
        setClientName(clientName)
      }
    })
    .catch(error => console.log(error))
  }, [clientId])

  useEffect(() => {
    setLast(searchParams.get("last"))
    setFrom(searchParams.get("from"))
    setTo(searchParams.get("to"))
  }, [searchParams])

  const lastLabel= last === "HOY" ? "hoy" : last === "7D" ? "últimos 7 días" : last === "30D" ? "últimos 30 días" : from && to && from.slice(0, 7) === to.slice(0, 7) ? getMonthName(from.slice(5, 7)) : from && to ? from + " al " + to : last === "LAST_MONTH" ? "mes pasado" : "toda la base de datos"

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{indicator.name} por día {clientName && `(${clientName})`}</CardTitle>
          <div>
            <Badge>{lastLabel}</Badge>
          </div>
        </div>
        <div className="flex">
          {["label"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl min-w-[100px]">
                  {total[key as keyof typeof total].toLocaleString("es-UY")}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={indicator.data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("es-UY", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-UY", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-label)`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

