import { getIndicatorByClient } from "@/services/analytics-service";
import { Suspense } from "react";
import AnalyticsHeader from "./analytics-header";
import GeneralDataPage from "./general-data";
import IndicatorsPanel, { SkeletonIndicatorsPanel } from "./indicators-panel";
import OneIndicatorDataPage, { ChartSkeleton } from "./one-indicator-data";
import { getClientName } from "@/services/clientService";

type Props= {
    searchParams: {
        from: string
        to: string
        last: string
        indicatorId: string
        cId: string
    }
}
export default async function AnalyticsPage({ searchParams }: Props) {
    let from= null
    let to= null
    const last= searchParams.last
    const indicatorId= searchParams.indicatorId
    const cId= searchParams.cId
    if (last === "HOY") {
        // from must be the beginning of the day and to must be the end of the day
        const today= new Date()
        from= new Date(today.getFullYear(), today.getMonth(), today.getDate())
        to= new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    } else if (last === "7D") {
        from= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)
        to= new Date()
    } else if (last === "30D") {
        from= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 30)
        to= new Date()
    } else if (last === "LAST_MONTH") {
        from= new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        console.log("from: ", from)
        // the day should be the last day of the previous month
        const firstDayOfCurrentMonth= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        // substract one day to get the last day of the previous month
        const lastDayOfPreviousMonth= new Date(firstDayOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000)
        to= new Date(new Date().getFullYear(), new Date().getMonth() - 1, lastDayOfPreviousMonth.getDate())
        console.log("to: ", to)
    } else if (last === "ALL") {
        from= null
        to= null
    } else {
        from= searchParams.from ? new Date(searchParams.from) : null
        to= searchParams.to ? new Date(searchParams.to) : null
    }

    const conversationsResult= await getIndicatorByClient("conversations", from, to, cId)
    const messagesResult= await getIndicatorByClient("messages", from, to, cId)
    const leadsResult= await getIndicatorByClient("leads", from, to, cId)

    const indicators= [leadsResult, conversationsResult, messagesResult]

    let clientName
    if (cId) {
        clientName= await getClientName(cId)
    }

    const actualMinute= new Date().getMinutes()

    return (
        <div className="flex flex-col items-center flex-grow w-full">
            <div className="flex w-full flex-grow">
                <Suspense key={"panel"+JSON.stringify(searchParams)} fallback={<SkeletonIndicatorsPanel />}>
                    <IndicatorsPanel indicators={indicators} indicatorId={indicatorId} searchParams={searchParams} />
                </Suspense>

                <div className="flex flex-col items-center w-full">
                    <AnalyticsHeader />
                    <p className="w-full text-right mr-1 max-w-4xl text-sm">Actualizado hace <span className="font-bold">{actualMinute} minutos</span></p>

                    <Suspense key={"one"+JSON.stringify(searchParams)} fallback={<ChartSkeleton />}>
                        <OneIndicatorDataPage indicatorId={indicatorId} from={from} to={to} last={last} cId={cId} clientName={clientName} />
                    </Suspense>
                    
                    <Suspense key={"general"+JSON.stringify(searchParams)} fallback={<ChartSkeleton />}>
                        <GeneralDataPage indicators={indicators} disabled={!!indicatorId} />
                    </Suspense>

                </div>
            </div>
        </div>
    );
}