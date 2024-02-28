import { getDataClientBySlug, getDataClientOfUser } from "@/app/admin/clients/(crud)/actions"
import { columns } from "@/app/admin/narvaez/narvaez-columns"
import { DataTable } from "@/app/admin/narvaez/narvaez-table"
import { getCurrentUser } from "@/lib/auth"
import { getFullNarvaezsDAO, getNarvaezsDAO } from "@/services/narvaez-services"
import { redirect } from "next/navigation"

type Props= {
  params: {
    slug: string
  }
}

export default async function NarvaezPage({ params }: Props) {
  const slug = params.slug
  
  if (slug !== "narvaez")
    return redirect(`/client/${slug}`)

  const data= await getFullNarvaezsDAO()

  return (
    <div className="w-full">      

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Narvaez"/>      
      </div>
    </div>
  )
}
  
