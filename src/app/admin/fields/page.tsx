import { getFullFieldsDAO } from "@/services/field-services"
import { FieldDialog } from "./field-dialogs"
import { DataTable } from "./field-table"
import { columns } from "./field-columns"

export default async function FieldPage() {
  
  const data= await getFullFieldsDAO()

  return (
    <div className="w-full">      

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Field"/>      
      </div>
    </div>
  )
}
  
