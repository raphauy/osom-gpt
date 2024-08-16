import { refreshMaterializedViews } from '@/services/analytics-service'
import { NextResponse } from 'next/server'

export const maxDuration = 59

//const RCPhone= process.env.RC_PHONE

const GRACE_PERIOD_IN_MINUTES = 10

export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    try {
        await refreshMaterializedViews()
        return NextResponse.json({ message: "Analytics refreshed successfully" })
    } catch (error) {
        console.error("Error refreshing analytics:", error)
        return NextResponse.json({ error: "Error refreshing analytics" }, { status: 500 })
    }
}