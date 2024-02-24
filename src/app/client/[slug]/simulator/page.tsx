"use client";

import { getActiveMessagesAction } from "@/app/admin/chat/actions";
import { getDataClientBySlug } from "@/app/admin/clients/(crud)/actions";
import { DeleteConversationDialog } from "@/app/client/[slug]/chats/(delete-conversation)/delete-dialogs";
import { useChat } from "ai/react";
import clsx from "clsx";
import { Bot, Loader, RefreshCcw, SendIcon, Terminal, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Textarea from "react-textarea-autosize";
import remarkGfm from "remark-gfm";

type Props= {
  params: {
    slug: string
  }
}  

export default function Chat({ params }: Props) {
  const slug= params.slug
  console.log(slug)
  
  
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [clientId, setClientId] = useState("")
  const [clientName, setClientName] = useState("")
  const [conversationId, setConversationId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [finishedCount, setFinishedCount] = useState(0)
  const [mapMessageSectioin, setMapMessageSectioin] = useState<Map<string, string[]>>(new Map())
  const session= useSession()
  const router= useRouter()

  const { messages, setMessages, input, setInput, handleSubmit, isLoading } = useChat({
    body: {
      clientId,
    },
    onFinish: () => {setFinishedCount((prev) => prev + 1)}
  })

  const searchParams= useSearchParams()

  useEffect(() => {
    
    getDataClientBySlug(slug)
    .then(client => {
      if (client) {
        setClientId(client.id)
        setClientName(client.nombre)
      }
    })
    .catch(error => console.log(error))

    // empty messages
    setMessages([])    
  }, [slug, setMessages, router, searchParams])


  useEffect(() => {
    const email= session?.data?.user?.email
    setUserEmail(email as string)
    console.log("updating messages")
    
    if (email) {
      getActiveMessagesAction(email, clientId)
      .then((res) => {
        if(!res) return

        const messages= showSystem ? res : res.filter(message => message.role !== "system")
        // @ts-ignore        
        setMessages(messages)
        setConversationId(res[0].conversationId)
      })
      .catch((err) => {
        console.log(err)
      })
    }
  }, [session, setMessages, clientId, showSystem, finishedCount])


  const disabled = isLoading || input.length === 0;

  return (
    <main className="flex flex-col items-center justify-between w-full pb-40">
      <div className="flex items-center justify-end w-full my-5">        
        <div className="flex items-center gap-2">
          <DeleteConversationDialog id={conversationId} description={`Seguro que desea eliminar la conversación de ${userEmail}?`} redirectUri={`/client/${slug}/simulator?r=${new Date().getMilliseconds()}`} />
        </div>
      </div>
      
      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 py-4",
              i % 2 === 0 ? "bg-gray-100" : "bg-white",
            )}
          >
            <div className="flex items-start w-full max-w-screen-md px-5 space-x-4 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : message.role === "system" ? "bg-blue-500" : "bg-black",
                )}
              >
              {message.role === "user" ? (
              <User width={20} />
              ) : message.role === "system" ? (
              <Terminal width={20} />
              ) : (
              <Bot width={20} />
              )
              }

              </div>
              {message.role !== "system" &&
                <ReactMarkdown
                  className="w-full mt-1 prose break-words prose-p:leading-relaxed"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // open links in new tab
                    a: (props) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>            
              }
            </div>            
          </div>
        ))
      ) : clientName && (
        <div className="max-w-screen-md mx-5 border rounded-md border-gray-200sm:mx-0 sm:w-full">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-lg font-semibold text-black">
              Bienvenido al asistente de {clientName}!
            </h1>
            <p className="text-gray-500">
              Este es un simulador de conversaciones.
            </p>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-0 flex flex-col items-center w-full p-5 pb-3 space-y-3 max-w-[350px] sm:max-w-[400px] md:max-w-[550px] lg:max-w-screen-md bg-gradient-to-b from-transparent via-gray-100 to-gray-100 sm:px-0">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full px-4 pt-3 pb-2 bg-white border border-gray-200 shadow-lg rounded-xl sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-4 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed bg-white"
                : "bg-green-500 hover:bg-green-600",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        
        <p className="text-xs text-center text-gray-400">
          Creado por {" "}
          <a
            href="https://www.osomdigital.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >            
            Osom Digital
          </a>
        </p>
      </div>

    </main>
  );
}
