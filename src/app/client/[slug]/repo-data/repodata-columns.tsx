"use client"

import { Button } from "@/components/ui/button"
import { RepoDataDAO } from "@/services/repodata-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { DeleteRepoDataDialog } from "./repodata-dialogs"
import CodeBlock from "@/components/code-block"
import ConversationButton from "@/app/admin/carservices/conversation-button"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { JsonValue } from "@prisma/client/runtime/library"


export const columns: ColumnDef<RepoDataDAO>[] = [
  
  {
    accessorKey: "repoName",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nombre
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "phone",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Teléfono
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (
        <div>
            <ConversationButton name={data.phone} conversationId={data.conversationId} /> 
        </div>
      )
    },
  },

  {
    accessorKey: "data",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Datos
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
    accessorKey: "UpdatedAt",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Fecha
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
		cell: ({ row }) => {
      const data= row.original
      return (<p>{format(data.updatedAt, "yyyy-MM-dd HH:mm", { locale: es})}</p>)
    }
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Do you want to delete RepoData ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <DeleteRepoDataDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


