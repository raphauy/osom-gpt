import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ConversationsTable, ConversationsTableSkeleton } from "./conversations-table";
import { Loader } from "lucide-react";

interface Props {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default async function ChatLayout({ children, params }: Props) {

  let client= null
  if (!params.slug) return <div>Cliente no encontrado</div>
  
  const currentUser = await getCurrentUser()

  if (currentUser?.role !== "admin" && currentUser?.role !== "osom" && currentUser?.role !== "cliente") {
    return redirect("/unauthorized?message=You are not authorized to access this page")
  }

  return (
    <>
      <div className="flex flex-grow w-full">
        <div className="flex flex-grow p-1 w-full">
          <div className="w-[350px] flex-shrink-0">
            <Suspense fallback={<ConversationsTableSkeleton />}>
              <ConversationsTable slug={params.slug} />
            </Suspense>
          </div>
          <div className="flex flex-grow w-full">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
