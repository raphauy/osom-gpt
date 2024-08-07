import { getModelsDAO } from "@/services/model-services"
import { ModelDialog } from "./model-dialogs"
import { DataTable } from "./model-table"
import { columns } from "./model-columns"

export default async function ModelPage() {
  
  const data= await getModelsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <ModelDialog />
      </div>

      <div className="mx-auto text-muted-foreground ml-3">
        <DataTable columns={columns} data={data} subject="Model"/>      
      </div>
    </div>
  )
}
  
