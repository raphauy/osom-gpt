import { getFullProductsDAO } from "@/services/product-services"
import { ProductDialog } from "./product-dialogs"
import { DataTable } from "./product-table"
import { columns } from "./product-columns"

export default async function ProductPage() {
  
  const data= await getFullProductsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <ProductDialog />
      </div>

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Product"/>      
      </div>
    </div>
  )
}
  
