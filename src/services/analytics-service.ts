import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { format } from "date-fns"

type IndicatorDefinition = {
    id: string
    name: string
    icon: string
    description: string
    tableName: string
}

const indicatorDefinitions: IndicatorDefinition[] = [
    {
        id: "conversations",
        name: "Conversaciones",
        icon: "MessagesSquare",
        description: "Cantidad de conversaciones",
        tableName: "conversation_count_by_date_client"
    },
    {
        id: "messages",
        name: "Mensajes",
        icon: "MessageCircle",
        description: "Cantidad de mensajes",
        tableName: "message_count_by_date_client"
    },
    {
        id: "leads",
        name: "Leads",
        icon: "Target",
        description: "Cantidad de Leads",
        tableName: "leads_count_by_date_client"
    }
]

export async function getIndicator(name: string, clientId: string, from: Date, to: Date) {
    const indicatorDefinition = indicatorDefinitions.find(indicator => indicator.name === name)
    if (!indicatorDefinition) return null

    const clientCondition = clientId === "ALL" ? Prisma.sql`` : Prisma.sql`"clientId" = ${clientId} AND`        

    const tableName = Prisma.sql([indicatorDefinition.tableName])
    const query = Prisma.sql`
        SELECT SUM(event_count) FROM ${tableName}
        WHERE ${clientCondition} "event_date" BETWEEN ${from}::date AND ${to}::date
    `
    //console.log("query: ", query)

    const result = await prisma.$queryRaw<{ sum: bigint }[]>(query)
    const sum = Number(result[0].sum)

    return sum
}

export type DataResult= {
    label: string    
    total: number
}
export type IndicatorResult= {
    id: string
    name: string
    icon: string
    total: number
    data: DataResult[]
}

export async function getIndicatorByClient(indicatorId: string, from: Date | null, to: Date | null, clientId: string | null): Promise<IndicatorResult> {

    const indicatorDefinition = indicatorDefinitions.find(indicator => indicator.id === indicatorId)
    if (!indicatorDefinition) throw new Error("Indicator not found")

    // const whereCondition= from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    // console.log("whereCondition: ", whereCondition)

    const dateCondition = from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    const clientCondition = clientId ? Prisma.sql`"clientId" = ${clientId}` : Prisma.sql`true`
    
    const whereCondition = Prisma.sql`${dateCondition} AND ${clientCondition}`

    const tableName = Prisma.sql([indicatorDefinition.tableName])
    const query = Prisma.sql`
        SELECT client_name, SUM(event_count) FROM ${tableName}
        WHERE ${whereCondition}
        GROUP BY "client_name"
        ORDER BY SUM(event_count) DESC
    `
    const result = await prisma.$queryRaw<{ client_name: string, sum: bigint }[]>(query)

    const data: DataResult[]= result.map(item => ({
        label: item.client_name,
        total: Number(item.sum)
    }))
    const total= data.reduce((acc, item) => acc + item.total, 0)
    const res: IndicatorResult= {
        id: indicatorDefinition.id,
        name: indicatorDefinition.name,
        icon: indicatorDefinition.icon,
        total,
        data
    }

    return res
}

export async function getIndicatorByDay(name: string, from: Date | null, to: Date | null, clientId: string | null): Promise<IndicatorResult> {
    const indicatorDefinition = indicatorDefinitions.find(indicator => indicator.id === name)
    if (!indicatorDefinition) throw new Error("Indicator not found")

    // const whereCondition= from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    // console.log("whereCondition: ", whereCondition)

    const dateCondition = from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    const clientCondition = clientId ? Prisma.sql`"clientId" = ${clientId}` : Prisma.sql`true`
    
    const whereCondition = Prisma.sql`${dateCondition} AND ${clientCondition}`
    console.log("whereCondition: ", whereCondition)

    const tableName = Prisma.sql([indicatorDefinition.tableName])
    const query = Prisma.sql`
        SELECT DATE(event_date) as day, SUM(event_count) FROM ${tableName}
        WHERE ${whereCondition}
        GROUP BY day
        ORDER BY day ASC
    `
    
    const result = await prisma.$queryRaw<{ day: string, sum: bigint }[]>(query)
    console.log("result: ", result)

    const data: DataResult[]= result.map(item => ({
//        label: format(new Date(item.day), 'yyyy-MM-dd'), // Usa date-fns para formatear la fecha
        label: new Date(item.day).toISOString().slice(0, 10),
        total: Number(item.sum)
    }))
    const total= data.reduce((acc, item) => acc + item.total, 0)
    const res: IndicatorResult= {
        id: indicatorDefinition.id,
        name: indicatorDefinition.name,
        icon: indicatorDefinition.icon,
        total,
        data
    }

    return res
}

export async function getIndicatorByMonth(name: string, from: Date | null, to: Date | null, clientId: string | null): Promise<IndicatorResult> {
    const indicatorDefinition = indicatorDefinitions.find(indicator => indicator.id === name)
    if (!indicatorDefinition) throw new Error("Indicator not found")

    // const whereCondition= from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    // console.log("whereCondition: ", whereCondition)

    const dateCondition = from && to ? Prisma.sql`"event_date" BETWEEN ${from}::date AND ${to}::date` : Prisma.sql`true`
    const clientCondition = clientId ? Prisma.sql`"clientId" = ${clientId}` : Prisma.sql`true`

    const whereCondition = Prisma.sql`${dateCondition} AND ${clientCondition}`
    
    const tableName = Prisma.sql([indicatorDefinition.tableName])
    const query = Prisma.sql`
        SELECT DATE_TRUNC('month', event_date) as month, SUM(event_count) FROM ${tableName}
        WHERE ${whereCondition}
        GROUP BY month
        ORDER BY month DESC
    `
    
    const result = await prisma.$queryRaw<{ month: string, sum: bigint }[]>(query)

    const data: DataResult[]= result.map(item => ({
        label: format(new Date(item.month), 'yyyy-MM'), // Usa date-fns para formatear la fecha
        total: Number(item.sum)
    }))
    const total= data.reduce((acc, item) => acc + item.total, 0)
    const res: IndicatorResult= {
        id: indicatorDefinition.id,
        name: indicatorDefinition.name,
        icon: indicatorDefinition.icon,
        total,
        data
    }

    return res
}



export async function refreshMaterializedViews() {

    const init= new Date().getTime()
    try {
        await prisma.$queryRaw`REFRESH MATERIALIZED VIEW conversation_count_by_date_client;`
        await prisma.$queryRaw`REFRESH MATERIALIZED VIEW message_count_by_date_client;`
        await prisma.$queryRaw`REFRESH MATERIALIZED VIEW leads_count_by_date_client;`

        const elapsedTime = new Date().getTime() - init
        console.log(`Analytics refreshed in ${elapsedTime / 1000} seconds`)
    
    } catch (error) {
        console.error('Error refreshing materialized views:', error);
        throw new Error('Failed to refresh materialized views');
    }
}