import { columns } from "@/app/admin/products/product-columns"
import { ProductDialog } from "@/app/admin/products/product-dialogs"
import { DataTable } from "@/app/admin/products/product-table"
import { getFullProductsDAO } from "@/services/product-services"

type Props = {
    params: {
      slug: string
    }
}
export default async function ProductPage({ params }: Props) {
  
    const slug = params.slug
    const data= await getFullProductsDAO(slug)

    return (
        <div className="w-full">      

            <div className="flex justify-end mx-auto my-2">
                <ProductDialog />
            </div>

            <div className="container p-3 py-4 mx-auto bg-white border rounded-md text-muted-foreground dark:text-white">
                <DataTable columns={columns} data={data} subject="Product"/>      
            </div>
        </div>
    )
}
  
