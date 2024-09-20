import { WebhookNotificationDialog } from "./webhooknotification-dialogs"
import { DataTable } from "./webhooknotification-table"
import { columns } from "./webhooknotification-columns"
import { getWebhookNotificationsDAO } from "@/services/webhook-notifications-service"
import { format, parse, subDays } from "date-fns"
import { toZonedTime } from "date-fns-tz"
import DateRangePicker from "./date-range-picker"

type Props = {
  searchParams: {
    start?: string
    end?: string
  }
}
export default async function WebhookNotificationPage({searchParams}: Props) {
  const now= new Date()
  console.log("now", now)
  
  const DaysBefore30= subDays(now, 30)
  const startDate= searchParams.start ? searchParams.start : format(DaysBefore30, "yyyy-MM-dd")
  const endDate= searchParams.end ? searchParams.end : format(now, "yyyy-MM-dd")

  const data= await getWebhookNotificationsDAO(startDate, endDate)
  const clientNames= data.map(d => d.clientName).filter((v, i, a) => a.indexOf(v) === i)
  const uniqueClientNames= Array.from(new Set(clientNames))

  return (
    <div className="w-full">      

      {/* <div className="flex mx-auto my-2">
        <DateRangePicker />
      </div> */}

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="WebhookNotification" clientNames={uniqueClientNames} columnsOff={["status", "clientName", "phone"]}/>
      </div>
    </div>
  )
}
  
