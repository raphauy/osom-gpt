import { getPromptVersionsDAO } from "@/services/prompt-version-services"
import { columns } from "./promptversion-columns"
import { PromptVersionDialog } from "./promptversion-dialogs"
import { DataTable } from "./promptversion-table"

export default async function PromptVersionPage() {
  

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <PromptVersionDialog />
      </div>

    </div>
  )
}
  
