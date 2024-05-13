import { getFullVendorsDAO } from "@/services/vendor-services"
import { VendorDialog } from "./vendor-dialogs"
import { DataTable } from "./vendor-table"
import { columns } from "./vendor-columns"

export default async function VendorPage() {
  
  const data= await getFullVendorsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <VendorDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Vendor"/>      
      </div>
    </div>
  )
}
  
