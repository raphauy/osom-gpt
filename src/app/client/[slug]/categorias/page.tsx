import { columns } from "@/app/admin/categorys/category-columns"
import { CategoryDialog } from "@/app/admin/categorys/category-dialogs"
import { DataTable } from "@/app/admin/categorys/category-table"
import { getFullCategorysDAO } from "@/services/category-services"

type Props = {
  params: {
    slug: string
  }
}
export default async function CategoryPage({ params }: Props) {
  
  const slug = params.slug
  const data= await getFullCategorysDAO(slug)

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <CategoryDialog />
      </div>

      <div className="container p-3 py-4 mx-auto bg-white border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Category"/>       
      </div>
    </div>
  )
}
  
