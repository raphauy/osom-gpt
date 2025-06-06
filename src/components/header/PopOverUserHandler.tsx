"use client"

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";


export default function PopOverUserHandler() {
  const { data:session }= useSession()

  const user= session?.user

  if (!user)
      return <div></div>

  function onLogout(){
    signOut({ callbackUrl: '/login' })    
  }
      
  return (
    <>
      <nav className="flex flex-col gap-2 mt-1 text-sm  min-w-[230px]">
        <ul>
          <li className="flex items-center gap-2 p-1 mb-5 ml-1 border-b">            
            <User /> {user.email} 
          </li>
          <li className="flex items-center w-full mt-16 border-t">
            <Button variant="ghost" className="w-full flex justify-start mt-2 hover:border px-2" onClick={onLogout}>
              <LogOut className="mr-2" />Logout
            </Button>
          </li>
        </ul>
      </nav>
    </>
  );
}

