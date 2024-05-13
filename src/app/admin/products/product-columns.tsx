"use client"

import { Button } from "@/components/ui/button"
import { ProductDAO } from "@/services/product-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteProductDialog, ProductDialog } from "./product-dialogs"


export const columns: ColumnDef<ProductDAO>[] = [
  
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
    accessorKey: "code",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Code
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "stock",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Stock
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "pedidoEnOrigen",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            PedidoEnOrigen
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "precioUSD",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            PrecioUSD
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

      const deleteDescription= `Do you want to delete Product ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <ProductDialog id={data.id} />
          <DeleteProductDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


