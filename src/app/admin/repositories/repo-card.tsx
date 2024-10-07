import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { RepositoryDAO } from "@/services/repository-services"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Briefcase, CalendarIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { DuplicateRepositoryDialog } from "./repository-dialogs"
import RepoMenu from "./work-menu"

type Props= {
  repository: RepositoryDAO
}


export function RepoCard({ repository }: Props) {
  const color = repository.color
  const clients= repository.function.clients
  const clientesStr= clients.length === 0 ? 
  "ninguno" : 
  clients.length === 1 ? 
  `1 cliente` : 
  `${clients.length} clientes`
  
  return (
      <Card className="w-full max-w-lg h-full">
        <Link href={`/admin/repositories/${repository.id}`} prefetch={false} className="w-full max-w-lg">
          <CardHeader
            className={`flex flex-col items-start gap-2 p-4 rounded-t-lg h-[130px]`}
            style={{
              background: `linear-gradient(45deg, ${color} 25%, ${color} 50%, ${color} 75%, ${color} 100%)`,
            }}
          >
            <CardTitle className="text-white">{repository.name}</CardTitle>
            <CardDescription className="text-white line-clamp-3">
              {repository.functionDescription}
            </CardDescription>
          </CardHeader>
        </Link>
        <CardContent className="p-4 space-y-2 flex justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>actualizado {formatDistanceToNow(repository.updatedAt, { locale: es })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 mb-1" />
              {
                clients.map(client => (
                  <Badge key={client.client.id} className="text-xs whitespace-nowrap">{client.client.name}</Badge>
                ))
              }
            </div>
          </div>
          <div>
            <RepoMenu repoId={repository.id} repoName={repository.name} />
          </div>
        </CardContent>
      </Card>
  )
}
