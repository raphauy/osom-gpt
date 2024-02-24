import { getCurrentUser } from "@/lib/auth";
import NotAlowedPage from "@/app/(auth)/unauthorized/page";
import { getDataClientBySlug, getDataClientOfUser } from "@/app/admin/clients/(crud)/actions";
import { getClientBySlug } from "@/services/clientService";
import { redirect } from "next/navigation";
import SideBar from "./side-bar";

interface Props {
  children: React.ReactNode
  params: {
    slug: string
  }
}

export default async function SlugLayout({ children, params }: Props) {
  const currentUser = await getCurrentUser()
  const slug = params.slug
  console.log("slug", slug)
  

  if (!currentUser) {
    return redirect("/unauthorized?message=Deberías estar logueado.")
  }

  let client= null
  if (currentUser.role === "admin" || currentUser.role === "osom") {
    client = await getDataClientBySlug(slug)
  } else if (currentUser.role === "cliente") {   
    client= await getDataClientOfUser(currentUser.id)    
  }
  if (!client) 
    return <div>Cliente no encontrado (l)</div>
  
  console.log("client slug: ", client.slug)
  
  
  if (slug !== client.slug)
    return redirect("/unauthorized?message=No tienes permisos para ver este cliente.")

  return (
    <>
      <div className="flex flex-grow w-full">
        <SideBar slug={slug} />
        <div className="flex flex-col items-center flex-grow p-1">{children}</div>
      </div>
    </>
  )
}
