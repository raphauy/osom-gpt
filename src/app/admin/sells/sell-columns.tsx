"use client"

import { Button } from "@/components/ui/button"
import { SellDAO } from "@/services/sell-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteSellDialog, SellDialog } from "./sell-dialogs"


export const columns: ColumnDef<SellDAO>[] = [
  
  {
    accessorKey: "externalId",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ExternalId
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "quantity",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Quantity
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "currency",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Currency
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },
  // {
  //   accessorKey: "role",
  //   header: ({ column }) => {
  //     return (
  //       <Button variant="ghost" className="pl-0 dark:text-white"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
  //         Rol
  //         <ArrowUpDown className="w-4 h-4 ml-1" />
  //       </Button>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Do you want to delete Sell ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <SellDialog id={data.id} />
          <DeleteSellDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


