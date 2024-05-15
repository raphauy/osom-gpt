import { columns } from "@/app/admin/sells/sell-columns"
import { DataTable } from "@/app/admin/sells/sell-table"
import { getFullSellsDAO } from "@/services/sell-services"

type Props = {
  params: {
    slug: string
  }
}

export default async function SellPage({ params }: Props) {
  const slug = params.slug
  
  const data= await getFullSellsDAO(slug)

  return (
    <div className="w-full mt-4 space-y-8">      
      <h1 className="text-3xl font-bold text-center">Ventas</h1>

      <div className="container p-3 py-4 mx-auto bg-white border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Ventas"/>      
      </div>
    </div>
  )
}
  
