import { getCurrentUser } from "@/lib/auth";
import { getClientBySlug } from "@/services/clientService";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ConversationsTable, ConversationsTableSkeleton } from "./conversations-table";

interface Props {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default async function ChatLayout({ children, params }: Props) {

  const currentUser = await getCurrentUser()

  if (currentUser?.role !== "admin" && currentUser?.role !== "osom" && currentUser?.role !== "cliente") {
    return redirect("/unauthorized?message=You are not authorized to access this page")
  }

  const client= await getClientBySlug(params.slug)
  if (!client) return <div>Cliente no encontrado</div>

  return (
    <>
      <div className="flex flex-grow w-full">
        <div className="flex flex-grow p-1 w-full">
          <div className="w-[350px] flex-shrink-0">
            <Suspense fallback={<ConversationsTableSkeleton />}>
              <ConversationsTable slug={params.slug} />
            </Suspense>
            {/* <ConversationsTable data={data} /> */}
          </div>
          <div className="flex flex-grow w-full">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}