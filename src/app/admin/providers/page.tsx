import { getProvidersDAO } from "@/services/provider-services"
import { ProviderDialog } from "./provider-dialogs"
import { DataTable } from "./provider-table"
import { columns } from "./provider-columns"

export default async function ProviderPage() {
  
  const data= await getProvidersDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <ProviderDialog />
      </div>

      <div className="mx-auto text-muted-foreground ml-3">
        <DataTable columns={columns} data={data} subject="Provider"/>      
      </div>
    </div>
  )
}
  
