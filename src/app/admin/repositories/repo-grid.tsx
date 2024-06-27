import { Card, CardContent } from "@/components/ui/card"
import { RepositoryDAO } from "@/services/repository-services"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import * as LucideIcons from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"

type Props= {
  repositories: RepositoryDAO[]
}
export default function RepoGrid({ repositories }: Props) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mt-4">
      {
        repositories.map(repository => (
          <Card key={repository.id} className="group flex flex-col min-w-80 p-6 w-full shadow-md text-muted-foreground h-52">

            <div className="flex items-center mb-4 text-gray-900 font-bold justify-between">
              <Link href={`/admin/repositories/${repository.id}`} prefetch={false} className="h-full flex items-center gap-2">
                <p className="dark:text-white flex-1">{repository.name}</p>
              </Link>
              <Link href={`/admin/repositories/${repository.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <LucideIcons.Settings className="w-6 h-6" />
              </Link>
                
            </div>
              <Link href={`/admin/repositories/${repository.id}`} prefetch={false} className="h-full flex flex-col justify-between">
                <CardContent className="p-0 line-clamp-3">
                    {repository.functionDescription}
                </CardContent>
              </Link>
              <div className="flex justify-between text-sm mt-2">                
                <div className="flex gap-2">
                  algo aquí
                </div>
                <p>{formatDistanceToNow(repository.createdAt, { locale: es })}</p>
              </div>
          </Card>
        ))
      }
    </div>
  )
}
