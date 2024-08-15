import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatNumberWithThousandsSeparator } from "@/lib/utils"
import { IndicatorResult } from "@/services/analytics-service"
import * as LucideIcons from "lucide-react"
import { Home } from "lucide-react"
import Link from "next/link"
import React from "react"

type Props= {
  indicators: IndicatorResult[]
  indicatorId: string
  searchParams: {
    from: string
    to: string
    last: string
    indicatorId: string
    cId: string
  }
}
export default async function IndicatorsPanel({ indicators, indicatorId, searchParams }: Props) {
  console.log("Search params: ", searchParams)
  
  // remove the indicatorId from the search params if it exists
  let paramsWithoutIndicatorId= ""
  if (searchParams.last) paramsWithoutIndicatorId+= `&last=${searchParams.last}`
  if (searchParams.from) paramsWithoutIndicatorId+= `&from=${searchParams.from}`
  if (searchParams.to) paramsWithoutIndicatorId+= `&to=${searchParams.to}`
  if (searchParams.cId) paramsWithoutIndicatorId+= `&cId=${searchParams.cId}`

  return (
    <aside className="flex flex-col gap-4 border-r bg-background pt-3 pr-2 w-96 flex-grow">
      <Link href="/analytics" prefetch={false} >
        <Button variant="outline" className="mb-4 w-full">
            <Home className="h-5 w-5" />
        </Button>
      </Link>
      {indicators.map((indicator) => {
        // @ts-ignore
        const icon= LucideIcons[indicator.icon]

        return(
          <Link key={indicator.name} href={`/analytics?indicatorId=${indicator.id}${paramsWithoutIndicatorId}`} prefetch={false}>
            <Card              
              className={cn("cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted", 
                indicator.id === indicatorId && "border-osom-color bg-green-50 dark:bg-green-800")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-medium">
                  {React.createElement(icon, { className: `w-5 h-5`})}
                  {indicator.name}
                </div>
                <div
                  className={cn("rounded-full px-2 py-1 text-xs font-medium bg-muted/40 border", 
                    indicator.id === indicatorId && "bg-background border-osom-color")}
                >
                  {formatNumberWithThousandsSeparator(indicator.total)}
                </div>
              </div>
            </Card>      
          </Link>
      )})}
    </aside>
  )
}

export function SkeletonIndicatorsPanel() {
  return (
    <aside className="flex flex-col gap-4 border-r bg-background pt-3 pr-2 w-96 flex-grow">
    <Skeleton className="w-full h-[50px] rounded-full mt-24" />
      <Skeleton className="w-full h-[50px] rounded-full" />
      <Skeleton className="w-full h-[50px] rounded-full" />
      <Skeleton className="w-full h-[50px] rounded-full" />
      <Skeleton className="w-full h-[50px] rounded-full" />
    </aside>
  )
}