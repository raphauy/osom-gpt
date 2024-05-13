"use client"

import { Button } from "@/components/ui/button"
import { ComClientDAO } from "@/services/comclient-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import { DeleteComClientDialog, ComClientDialog } from "./comclient-dialogs"


export const columns: ColumnDef<ComClientDAO>[] = [
  
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
    accessorKey: "departamento",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Departamento
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "localidad",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Localidad
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "direccion",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Direccion
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "telefono",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Telefono
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

      const deleteDescription= `Do you want to delete ComClient ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <ComClientDialog id={data.id} />
          <DeleteComClientDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


