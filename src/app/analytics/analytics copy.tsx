"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { CartesianGrid, XAxis, Line, LineChart, Bar, BarChart } from "recharts"
import { ChartTooltipContent, ChartTooltip, ChartContainer } from "@/components/ui/chart"
import { DollarSignIcon, Home, MailOpenIcon, MessageCircleIcon, UserPlusIcon, UsersIcon } from "lucide-react"

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState<string>("Mensajes")
  const [dateRange, setDateRange] = useState("30d")
  const [client, setClient] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({ start: null as string | null, end: null as string | null })
  const metrics = [
    {
      title: "Conversaciones",
      value: 1234,
      icon: <MessageCircleIcon className="h-5 w-5" />,
      chart: <LinechartChart className="aspect-[4/3]" />,
    },
    {
      title: "Mensajes",
      value: 5678,
      icon: <MailOpenIcon className="h-5 w-5" />,
      chart: <BarchartChart className="aspect-[4/3]" />,
    },
    {
      title: "Leads",
      value: 456,
      icon: <UserPlusIcon className="h-5 w-5" />,
      chart: <LinechartChart className="aspect-[4/3]" />,
    },
    {
      title: "Ingresos",
      value: 12345,
      icon: <DollarSignIcon className="h-5 w-5" />,
      chart: <LinechartChart className="aspect-[4/3]" />,
    },
    ]
  const handleMetricSelect = (metric: string) => {
    setSelectedMetric(metric)
  }
  const handleDateRangeChange = (range: string) => {
    setDateRange(range)
    setCustomDateRange({ start: null, end: null })
  }
  const handleCustomDateRangeChange = (value: string[]) => {
    setDateRange("custom")
    setCustomDateRange({ start: value[0], end: value[1] })
  }
  const handleClientChange = (client: string) => {
    setClient(client)
  }
  return (
    <div className="grid min-h-screen w-full grid-cols-[280px_1fr] bg-muted/40">
      <aside className="flex flex-col gap-4 border-r bg-background p-4 pt-3">
        <Button variant="outline" className="mb-4">
            <Home className="h-5 w-5" />
        </Button>
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className={`cursor-pointer rounded-lg p-4 transition-colors hover:bg-muted ${
              selectedMetric === metric.title ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
            }`}
            onClick={() => handleMetricSelect(metric.title)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-medium">
                {metric.icon}
                {metric.title}
              </div>
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  selectedMetric === metric.title ? "bg-primary-foreground/20" : "bg-muted/40"
                }`}
              >
                {metric.value}
              </div>
            </div>
          </Card>
        ))}
      </aside>
      <main className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <Button
              variant={dateRange === "7d" ? "outline" : "ghost"}
              onClick={() => handleDateRangeChange("7d")}
              className={dateRange === "7d" ? "border" : ""}
            >
              7D
            </Button>
            <Button
              variant={dateRange === "30d" ? "outline" : "ghost"}
              onClick={() => handleDateRangeChange("30d")}
              className={dateRange === "30d" ? "border" : ""}
            >
              30D
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateRange === "custom" ? "outline" : "ghost"}
                  onClick={() => handleDateRangeChange("custom")}
                  className={dateRange === "custom" ? "border" : ""}
                >
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 max-w-[276px]">
                <Calendar mode="range"></Calendar>
              </PopoverContent>
            </Popover>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  {client === "all" ? "Todos los clientes" : client}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleClientChange("all")}>Todos los clientes</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleClientChange("cliente1")}>Cliente 1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleClientChange("cliente2")}>Cliente 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleClientChange("cliente3")}>Cliente 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{metrics.find(metric => metric.title === selectedMetric)?.title}</CardTitle>
            </CardHeader>
            <CardContent>{metrics.find(metric => metric.title === selectedMetric)?.chart}</CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function BarchartChart(props: any) {
  return (
    <div {...props}>
      <ChartContainer
        config={{
          desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="min-h-[300px]"
      >
        <BarChart
          accessibilityLayer
          data={[
            { month: "January", desktop: 186 },
            { month: "February", desktop: 305 },
            { month: "March", desktop: 237 },
            { month: "April", desktop: 73 },
            { month: "May", desktop: 209 },
            { month: "June", desktop: 214 },
          ]}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}



function LinechartChart(props: any) {
  return (
    <div {...props}>
      <ChartContainer
        config={{
          desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
          },
        }}
      >
        <LineChart
          accessibilityLayer
          data={[
            { month: "January", desktop: 186 },
            { month: "February", desktop: 305 },
            { month: "March", desktop: 237 },
            { month: "April", desktop: 73 },
            { month: "May", desktop: 209 },
            { month: "June", desktop: 214 },
          ]}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Line dataKey="desktop" type="natural" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}


