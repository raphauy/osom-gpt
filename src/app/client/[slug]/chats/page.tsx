"use client"

import { DataClient, getDataClientBySlug } from "@/app/admin/clients/(crud)/actions"
import { Loader } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { DataConversation, getDataConversationAction, getDataConversations, getLastDataConversationAction } from "./actions"
import { columns } from "./columns"
import ConversationBox from "./conversation-box"
import { DataTable } from "./data-table"
import { toast } from "@/components/ui/use-toast"

interface Props {
  params: {
    slug: string
  }
  searchParams: {
    id: string
  }
}
  
export default function ChatPage({ searchParams: { id }, params: { slug } }: Props) {
  const session= useSession()

  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [showSystem, setShowSystem] = useState(false)

  const [conversation, setConversation] = useState<DataConversation>()

  useEffect(() => {
    setLoadingChat(true)

    if (!id) {
      if (!slug) return
  
      getLastDataConversationAction(slug)
      .then(conversation => {
        if (conversation) setConversation(conversation)
      })    
      .catch(error => console.log(error))
      .finally(() => setLoadingChat(false))
    } else {
      getDataConversationAction(id)
      .then(conversation => {
        if (conversation) setConversation(conversation)
      })
      .catch(error => console.log(error))
      .finally(() => setLoadingChat(false))
    }

    

  }, [id, slug])
  

  if (!conversation) return <div></div>

  const user= session.data?.user

  const isAdmin= user?.role === "admin"

  return (
    <div className="flex flex-grow w-full">

      <div className="flex flex-col items-center flex-grow p-1">
        {
          loadingChat ?
          <Loader className="w-6 h-6 animate-spin" /> :
          <ConversationBox 
            conversation={conversation} 
            isAdmin={isAdmin} 
            showSystem={showSystem} 
            setShowSystem={setShowSystem} 
            promptTokensPrice={0.01}
            completionTokensPrice={0.03}
          />
        }
        
      </div>
    </div>

    );
  }
    