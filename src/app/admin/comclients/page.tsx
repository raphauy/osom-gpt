import { getFullComClientsDAO } from "@/services/comclient-services"
import { ComClientDialog } from "./comclient-dialogs"
import { DataTable } from "./comclient-table"
import { columns } from "./comclient-columns"

export default async function ComClientPage() {
  
  const data= await getFullComClientsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <ComClientDialog />
      </div>

      <div className="container p-3 py-4 mx-auto bg-white border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="ComClient"/>      
      </div>
    </div>
  )
}
  
