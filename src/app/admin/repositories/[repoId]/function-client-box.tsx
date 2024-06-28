"use client"

import { FunctionClientDAO } from "@/services/function-services"
import Link from "next/link"
import { setWebHookUrlAction } from "../repository-actions"
import { HookForm } from "./hook-form"
import useCopyToClipboard from "@/lib/useCopyToClipboard"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

type Props= {
    repoId: string
    functionClient: FunctionClientDAO
}
export default function FunctionClientBox({ repoId, functionClient }: Props) {
  const [value, copy] = useCopyToClipboard()
  const [endpoint, setEndpoint] = useState(`/api/${functionClient.client.id}/repo-data/${repoId}`)
  
  function copyHookToClipboard(){   
    copy(endpoint)    
    toast({title: "Endpoint copiado" })
}

  return (
    <div className="grid gap-2 pl-6">
      <div>
        <p className="font-bold">Data API: </p>
        <div className="flex items-center justify-between">
          <p className="truncate lg:max-w-[200px] xl:max-w-xs">{endpoint}</p>
          <Button variant="ghost" className="p-1 h-7"><Copy onClick={copyHookToClipboard} /></Button>            
        </div>
      </div>
      <div>
        <p className="font-bold">Hook de notificación:</p>
        {
          functionClient.webHookUrl ?
          <HookForm clientId={functionClient.clientId} functionId={functionClient.functionId} initialValue={functionClient.webHookUrl} update={setWebHookUrlAction} />
          :
          <HookForm clientId={functionClient.clientId} functionId={functionClient.functionId} initialValue={"agregar un hook de notificación"} update={setWebHookUrlAction} />
        }
      </div>
    </div>
)
}
