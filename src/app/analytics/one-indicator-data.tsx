import { BarChartHorizontal } from "@/components/charts/bar-chart-horizontal";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { RadialChart } from "@/components/charts/radial-chart";
import { SixMonthChart } from "@/components/charts/six-month-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getIndicatorByClient, getIndicatorByDay, getIndicatorByMonth, IndicatorResult } from "@/services/analytics-service";

type Props= {
    indicatorId: string
    from: Date | null
    to: Date | null
    last: string | null
    cId: string | null
    clientName?: string | null
}
export default async function OneIndicatorDataPage({ indicatorId, from, to, last, cId, clientName }: Props) {
  if (!indicatorId) return null

  console.log("indicatorId: ", indicatorId)
  console.log("from: ", from)
  console.log("to: ", to)
  console.log("last: ", last)
  console.log("cId: ", cId)

  const today= new Date()

  if (last === "HOY") {
    // from must be the beginning of the day and to must be the end of the day
    from= new Date(today.getFullYear(), today.getMonth(), today.getDate())
    to= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  } else if (last === "7D") {
    from= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)
    to= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  } else if (last === "30D") {
      from= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30)
      to= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  } else if (last === "ALL") {
      from= null
      to= null
  }

  const indicatorByDay= await getIndicatorByDay(indicatorId, from, to, cId)
  const indicatorByClient= await getIndicatorByClient(indicatorId, from, to, cId)
  const indicatorByMonth= await getIndicatorByMonth(indicatorId, from, to, cId)
  
  return (
    <div className="flex flex-col gap-4 w-full p-6">        
        { last !== "HOY" && <LineChartComponent indicator={indicatorByDay} /> }
        <div className={cn("w-full mx-auto max-w-4xl grid gap-4", clientName || last === "7D" || last === "HOY" ? "xl:grid-cols-1" : "xl:grid-cols-2")}>
          <RadialChart indicator={indicatorByClient} clientName={clientName} />
          { last !== "7D" && last !== "HOY" && <SixMonthChart indicator={indicatorByMonth} clientName={clientName} /> }
        </div>
        {!clientName && <BarChartHorizontal indicator={indicatorByClient} />}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="w-full max-w-4xl mt-5 ml-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Skeleton className="w-40 h-7 rounded-full" />
          <Skeleton className="w-20 h-7 rounded-full" />
        </CardTitle>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="w-8/12 h-[30px]" />
          <Skeleton className="w-3/12 h-[30px]" />
          <Skeleton className="w-5/12 h-[30px]" />
          <Skeleton className="w-4/12 h-[30px]" />
          <Skeleton className="w-3/12 h-[30px]" />
          <Skeleton className="w-8/12 h-[40px]" />
          <Skeleton className="w-3/12 h-[40px]" />
          <Skeleton className="w-5/12 h-[40px]" />
          <Skeleton className="w-4/12 h-[40px]" />
        </div>
      </CardContent>
    </Card>
  )
}