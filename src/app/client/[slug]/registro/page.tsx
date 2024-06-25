import { getDataClientBySlug } from "@/app/admin/clients/(crud)/actions"
import { getClientsOfFunctionByName } from "@/services/function-services"
import { getFullNarvaezsDAOByClient } from "@/services/narvaez-services"
import { redirect } from "next/navigation"
import { DataTable } from "./registro-table"
import { columns } from "./registro-columns"

type Props= {
  params: {
    slug: string
  }
}

export default async function NarvaezPage({ params }: Props) {

  const slug = params.slug

  const clientsOfNarvaez= await getClientsOfFunctionByName("registrarPedido")
  
  if (!clientsOfNarvaez.map(c => c.slug).includes(slug))
    return redirect(`/client/${slug}`)

  const client= await getDataClientBySlug(slug)
  if (!client)
    return <div>Cliente no encontrado</div>

  const data= await getFullNarvaezsDAOByClient(client.id)

  return (
    <div className="w-full">      

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Registro"/>       
      </div>
    </div>
  )
}
  
