"use client"

import { Button } from "@/components/ui/button"
import { FunctionDAO } from "@/services/function-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Database } from "lucide-react"
import { format } from "date-fns"
import { DeleteFunctionDialog, FunctionDialog } from "./function-dialogs"
import Link from "next/link"


export const columns: ColumnDef<FunctionDAO>[] = [
  
  {
    accessorKey: "name",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nombre
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
  },

  {
    accessorKey: "definition",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Definición
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (
        <p className="text-sm whitespace-pre-wrap">{data.definition}</p>
      )
    }
  },
  {
    accessorKey: "clients",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Clientes
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (
        <p className="text-sm whitespace-pre-wrap">{data.clients?.length || 0}</p>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Seguro que quieres eliminar la función ${data.name}?
      Tiene ${data.clients?.length} clientes asociados`
 
      if (data.repositories?.length > 0) {
        return (
          <Link href={`/admin/repositories/${data.repositories[0].id}`} prefetch={false}>
            <Button variant="ghost">
              <Database className="w-5 h-5 text-gray-500" />
            </Button>
          </Link>
        )
      }
      return (
        <div className="flex items-center justify-end gap-2">

          <FunctionDialog id={data.id} />
          <DeleteFunctionDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


