import { getFullRepoDatasDAO } from "@/services/repodata-services"
import { DataTable } from "./repodata-table"
import { columns } from "./repodata-columns"

type Props= {
  params: {
    slug: string
  }
}

export default async function RepoDataPage({ params }: Props) {

  const slug = params.slug

  const data= await getFullRepoDatasDAO(slug)
  const repoNames= Array.from(new Set(data.map(repo => repo.repoName)))

  return (
    <div className="w-full">      

      <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
        <DataTable columns={columns} data={data} subject="RepoData" repoNames={repoNames} repoLabel="Trámites"/>
      </div>
    </div>
  )
}
  
