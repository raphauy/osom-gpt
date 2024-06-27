import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import SideBar from "./side-bar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return redirect("/login")
  }

  if (currentUser?.role !== "admin") {
    return redirect("/unauthorized?message=You are not authorized to access this page")
  }

  return (
    <>
      <div className="flex flex-grow w-full">
        <SideBar />
        <div className="flex flex-col items-center flex-grow p-1">
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </div>
      </div>
    </>
  )
}
