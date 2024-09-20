"use client"

import { Button } from "@/components/ui/button"
import { WebhookNotificationDAO } from "@/services/webhook-notifications-service"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, RefreshCcw, XCircle } from "lucide-react"
import { format } from "date-fns"
import { DeleteWebhookNotificationDialog, WebhookNotificationDialog } from "./webhooknotification-dialogs"
import WebhookCard from "./webhook-card"
import CodeBlock from "@/components/code-block"
import ResendWebhookButton from "./resend-webhook-button"
import { toZonedTime } from "date-fns-tz"
import React from "react"


export const columns: ColumnDef<WebhookNotificationDAO>[] = [
  
  {
    accessorKey: "functionName",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Info
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (
        <WebhookCard 
          clientName={data.clientName} 
          functionName={data.functionName} 
          status={data.status} 
          phone={data.phone} 
          webhookUrl={data.webhookUrl} 
          duration={data.duration} />
      )
    }
  },

  {
    accessorKey: "data",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Data
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      let data = row.original.data

      // Parsear el string JSON a un objeto
      if (typeof data === "string") {
        data = JSON.parse(data)
      }
    
      // Reemplazar booleanos y luego serializar a string con formato
      const jsonReplaced = JSON.stringify(data, (key, value) => {
        if (value === true) return "SI"
        if (value === false) return "NO"
        return value;
      }, 2)

      return <CodeBlock code={jsonReplaced} showLineNumbers={false} />
    },
    filterFn: (row, id, value) => {
      const jsonStr = JSON.stringify(row.original.data, null, 2)
      .replace(/false/g, "NO")
      .replace(/true/g, "SI");
      return jsonStr.toLowerCase().includes(value.toLowerCase())
    },
  },

  {
    accessorKey: "response",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Response
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const response = row.original.response
      const error = row.original.error
      const status = row.original.status
      const zonedTimestamp = toZonedTime(row.original.timestamp, "America/Montevideo")
      const timestamp = format(zonedTimestamp, "dd/MM/yyyy HH:mm:ss")
      const resendStatus= row.original.resendStatus
      const resendIcon= resendStatus === "error" ? XCircle : resendStatus === "success" ? CheckCircle : RefreshCcw
      const resendIconColor= resendStatus === "error" ? "text-red-500" : resendStatus === "success" ? "text-green-500" : "text-blue-500"
      return (
        <div className="flex flex-col justify-between gap-2 border p-2 rounded-md min-w-[200px] h-full bg-background">
          <div className="text-center">
            
            { error ? 
              <div className="text-red-500">Error: {error}</div> 
              :
              <div>Response: {response}</div>
            }
          </div>

          { status === "error" && <ResendWebhookButton id={row.original.id} /> }

          { status === "resend" && 
            <div className="text-center font-bold flex justify-center items-center gap-1">
              Reintentado {React.createElement(resendIcon, { className: resendIconColor })}
            </div> 
          }

          { status === "success" && 
            <div className="text-center font-bold flex justify-center items-center gap-1">
              Enviado <CheckCircle className="text-green-500" />
            </div> 
        
          }

          <div className="text-center font-bold">{timestamp}</div>
        </div>
      )
    },
  },

  {
    accessorKey: "status",
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "clientName",
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "phone",
    enableHiding: true,
  }
]


