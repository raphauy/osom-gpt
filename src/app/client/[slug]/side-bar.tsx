"use client"

import { cn } from "@/lib/utils";
import { BarChartHorizontalBig, BookOpen, ChevronRightSquare, LayoutDashboard, MessageCircle, Receipt, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  slug: string
}
export default function SideBar({ slug }: Props) {

  const data= [
    {
      href: `/client/${slug}`,
      icon: LayoutDashboard,
      text: "Dashboard"
    },
    {
      href: "divider", icon: User
    },
    {
      href: `/client/${slug}/documents`,
      icon: BookOpen,
      text: "Documentos"
    },
    {
      href: `/client/${slug}/chats`,
      icon: MessageCircle,
      text: "Conversaciones"
    },
    {
      href: `/client/${slug}/prompt`,
      icon: ChevronRightSquare,
      text: "Prompt"
    },
    {
      href: "divider", icon: User
    },
    {
      href: `/client/${slug}/billing`,
      icon: Receipt,
      text: "Costos por uso"
    },
    {
      href: "divider", icon: User
    },  
    {
      href: `/client/${slug}/users`,
      icon: User,
      text: "Usuarios"
    },
  ]

  const path= usePathname()

  const commonClasses= "flex gap-2 items-center py-1 mx-2 rounded hover:bg-gray-200 dark:hover:text-black"
  const selectedClasses= "font-bold text-osom-color dark:border-r-white"

  const isChatPage= path.startsWith(`/client/${slug}/chats`)

  return (
    <div className={cn("flex flex-col justify-between border-r border-r-osom-color/50", !isChatPage && "lg:pl-8")}>
      <section className="flex flex-col gap-3 py-4 mt-3 ">
        {data.map(({ href, icon: Icon, text }, index) => {
          if (href === "divider") return divider(index)
          
          const selected= path.endsWith(href)
          const classes= cn(commonClasses, selected && selectedClasses)
          return (
            <Link href={href} key={href} className={classes}>
              <Icon size={23} />
              <p className={cn("hidden", !isChatPage && "md:block md:w-36")}>{text}</p>                  
            </Link>
          )
        })}

        {divider()}



      </section>
    </div>
  );
}


function divider(key?: number) {
  return <div key={key} className="mx-2 my-5 border-b border-b-osom-color/50" />
}
