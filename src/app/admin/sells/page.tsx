import { getFullSellsDAO } from "@/services/sell-services"
import { SellDialog } from "./sell-dialogs"
import { DataTable } from "./sell-table"
import { columns } from "./sell-columns"

export default async function SellPage() {
  
  const data= await getFullSellsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <SellDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Sell"/>      
      </div>
    </div>
  )
}
  
