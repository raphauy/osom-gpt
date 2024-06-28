import { Button } from "@/components/ui/button"
import { getClientBySlug, getCountData } from "@/services/clientService"
import { Bot } from "lucide-react"
import Link from "next/link"
import ClientData from "./client-data"

interface Props{
  params: {
    slug: string
  },
}
 
export default async function ClientPage({ params: { slug } }: Props) {

  
  const client= await getClientBySlug(slug)
  if (!client) return <div>Cliente no encontrado (p)</div>

  const countData= await getCountData(client?.id)
 
  return (
    <div className="flex flex-col items-center gap-10">
      <ClientData countData={countData} />

      <Link href={`/client/${slug}/simulator`}>
          <Button variant="outline">
              <Bot size={22} className="mr-2 mb-1.5" />
              <p>Simulador</p>
          </Button>
      </Link>


    </div>
  )
}
