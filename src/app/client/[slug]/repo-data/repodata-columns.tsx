"use client"

import { Button } from "@/components/ui/button"
import { RepoDataDAO } from "@/services/repodata-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { DeleteRepoDataDialog } from "./repodata-dialogs"
import CodeBlock from "@/components/code-block"


export const columns: ColumnDef<RepoDataDAO>[] = [
  
  {
    accessorKey: "repoName",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Info
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
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
      const data= row.original
      const jsonReplacedNo= JSON.stringify(data.data, null, 2).replace("false", "NO")
      const jsonReplacedYes= jsonReplacedNo.replace("true", "SI")

      return <CodeBlock code={jsonReplacedYes} showLineNumbers={false} />
    },
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

      const deleteDescription= `Do you want to delete RepoData ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <DeleteRepoDataDialog description={deleteDescription} id={data.id} />
        </div>

      )
    },
  },
]


