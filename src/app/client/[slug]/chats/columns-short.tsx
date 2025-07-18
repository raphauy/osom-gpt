"use client"

import { Button } from "@/components/ui/button"
import { getFormat, getFormatWithTime } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { DataConversationShort } from "./actions"

export const columns: ColumnDef<DataConversationShort>[] = [
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Última actividad
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data= row.original
      const timeZone= data.client.timezone
      const formatted = getFormatWithTime(data.updatedAt, timeZone)
      return (
        <div className="flex flex-col items-start justify-start">
          <span className="font-semibold">{formatted.primary}</span>
          <span className="text-xs text-muted-foreground">{formatted.secondary}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Celular
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )
    },
    cell: ({ row }) => {
      const data= row.original
 
      return (
        <div className="flex flex-col items-start justify-start flex-1">
          <Link href={`/client/${data.client.slug}/chats?id=${data.id}`} prefetch={false}>
              <Button variant="link" className="pl-0 dark:text-white h-auto py-0">
                {data.phone.slice(0, 13)}
              </Button>
          </Link>
          <span className="text-xs invisible">placeholder</span>
        </div>

      )
    },

  },
]
