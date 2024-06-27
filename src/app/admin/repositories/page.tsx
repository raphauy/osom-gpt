import { getFullRepositorysDAO } from "@/services/repository-services"
import RepositoriesTabs from "./repo-tabs"
import { DataTable } from "./repository-table"
import { columns } from "./repository-columns"

export default async function RepositoryPage() {
  
  const repositories= await getFullRepositorysDAO()

  return (
    <div>

      <RepositoriesTabs repositories={repositories} />

    </div>
  )
}
