import { getClientBySlug } from "@/services/clientService"
import { getFullRepoDatasDAO, getRepoNames } from "@/services/repodata-services"
import FilterBar from "./filter-bar"
import { columns } from "./repodata-columns"
import { DataTable } from "./repodata-table"

type Props= {
  params: {
    slug: string
  }
  searchParams: {
    start?: string
    end?: string
    repoName?: string
  }
}

export default async function RepoDataPage({ params, searchParams }: Props) {

  const startStr= searchParams.start
  const endStr= searchParams.end
  const repoName= searchParams.repoName


  const slug = params.slug
  const client= await getClientBySlug(slug)
  if (!client) return <div>Cliente no encontrado</div>

  const data= await getFullRepoDatasDAO(slug, startStr, endStr, repoName)
  console.log("data: ", data)
  const repoNames= await getRepoNames(client.id)

  return (
    <div className="w-full">      
      <FilterBar slug={slug} timeZone={client.timezone} repoNames={repoNames} />

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground ">
        <DataTable columns={columns} data={data} subject="RepoData" repoNames={repoNames} repoLabel={client.repoLabel}/>
      </div>
    </div>
  )
}
  
