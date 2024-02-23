import { getFunctionsDAO } from "@/services/function-services"
import { FunctionDialog } from "./function-dialogs"
import { DataTable } from "./function-table"
import { columns } from "./function-columns"

export default async function UsersPage() {
  
  const data= await getFunctionsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <FunctionDialog />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Function"/>      
      </div>
    </div>
  )
}
  
