"use client";

import React from "react";
import { CustomInfo, getActiveMessagesAction, getCustomInfoAction } from "@/app/admin/chat/actions";
import { DataClient, getDataClientBySlug } from "@/app/admin/clients/(crud)/actions";
import { getModelDAOActionByName } from "@/app/admin/models/model-actions";
import { CloseConversationDialog } from "@/app/client/[slug]/chats/(delete-conversation)/delete-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { getFormatInTimezone, getFormatWithTime } from "@/lib/utils";
import { ModelDAO } from "@/services/model-services";
import { useChat } from "ai/react";
import clsx from "clsx";
import { Bot, Car, CircleDollarSign, Loader, Podcast, RefreshCcw, SendIcon, Terminal, Ticket, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Textarea from "react-textarea-autosize";
import remarkGfm from "remark-gfm";
import GPTData from "../chats/gpt-data";
import { setLLMOffAction } from "./actions";
import { sanitizeMarkdown } from "@/lib/utils";

export default function SimulatorBox() {
  const params= useParams()
  const slug= params.slug as string
  const searchParams= useSearchParams()
  const model= searchParams.get("model")
  
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [client, setClient] = useState<DataClient | null>(null)
  const [promptTokensPrice, setPromptTokensPrice] = useState(0)
  const [completionTokensPrice, setCompletionTokensPrice] = useState(0)
  const [promptCostTokenValue, setPromptCostTokenValue] = useState(0)
  const [completionCostTokenValue, setCompletionCostTokenValue] = useState(0)
  const [conversationId, setConversationId] = useState("")  
  const [customInfo, setCustomInfo] = useState<CustomInfo | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [finishedCount, setFinishedCount] = useState(0)
  const [modelDAO, setModelDAO] = useState<ModelDAO | null>(null)

  const session= useSession()
  const isAdmin= session?.data?.user?.role === "admin"
  const router= useRouter()

  const { messages, setMessages, input, setInput, handleSubmit, isLoading, error } = useChat({
    body: {
      clientId: client?.id,
      modelName: model
    },
    onFinish: () => {onFinishActions()}
  })

  function onFinishActions() {
    setFinishedCount((prev) => prev + 1)
    getCustomInfoAction(conversationId)
    .then((customInfo) => {
      if (customInfo) {
        setCustomInfo(customInfo)
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  // @ts-ignore
  const totalPromptTokens= messages.reduce((acc, message) => acc + message.promptTokens, 0)
  // @ts-ignore
  const totalCompletionTokens= messages.reduce((acc, message) => acc + message.completionTokens, 0)
  const promptTokensValue= totalPromptTokens / 1000000 * promptTokensPrice
  const completionTokensValue= totalCompletionTokens / 1000000 * completionTokensPrice

  useEffect(() => {
    if (model) {
      getModelDAOActionByName(model)
      .then((modelDAO) => {
        if (modelDAO) {
          setModelDAO(modelDAO)
          const promptCostTokenValue= totalPromptTokens / 1000000 * (modelDAO.inputPrice || 0)          
          const completionCostTokenValue= totalCompletionTokens / 1000000 * (modelDAO.outputPrice || 0)
          setPromptCostTokenValue(promptCostTokenValue)
          setCompletionCostTokenValue(completionCostTokenValue)
        }
      })
      .catch((err) => {
        console.log(err)
      })
    }
  }, [model, totalPromptTokens, totalCompletionTokens])

  useEffect(() => {
    getCustomInfoAction(conversationId)
    .then((customInfo) => {
      if (customInfo) {
        setCustomInfo(customInfo)
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }, [conversationId])

  useEffect(() => {
    setLoading(true)
    
    getDataClientBySlug(slug)
    .then(client => {
      if (client) {
        setClient(client)
        client.promptTokensPrice && setPromptTokensPrice(client.promptTokensPrice)
        client.completionTokensPrice && setCompletionTokensPrice(client.completionTokensPrice)
      }
    })
    .catch(error => console.log(error))

    // empty messages
    setMessages([]) 
    setLoading(false)   
  }, [slug, setMessages, router, searchParams])


  useEffect(() => {
    if (!client) return

    setLoading(true)
    const email= session?.data?.user?.email
    setUserEmail(email as string)
    console.log("updating messages")
    
    if (email) {
      getActiveMessagesAction(email, client.id)
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
    setLoading(false)
  }, [session, setMessages, client, showSystem, finishedCount])


  if (!model) return <div>No se ha seleccionado un modelo</div>


  const disabled = isLoading || input.length === 0 || customInfo?.conversationLLMOff

  function handleLLMOn() {
    setLoading(true)
    setLLMOffAction(conversationId, false)
    .then(() => {
      toast({ title: "LLM habilitado" })
    })
    .catch((err) => {
      toast({ title: "Error al habilitar LLM", description: err.message, variant: "destructive" })
    })
    .finally(() => {
      onFinishActions()
      setLoading(false)
    })
  }
  return (
    <main className="flex flex-col items-center justify-between w-full pb-40">
      {
        isAdmin ?
        <div className="flex items-center justify-between w-full my-5">        
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Podcast className="text-green-500" />
              </TooltipTrigger>
              <TooltipContent className="text-sm text-gray-500">
                Este modelo y proveedor ambos tienen capacidades de streaming de datos.
              </TooltipContent>
            </Tooltip>
            { client?.sessionTTL && <Badge>{client.sessionTTL} min</Badge> }
            
            {
              customInfo?.conversationLLMOff && <Badge>LLM Off</Badge>
            }
          </div>
          <div className="flex items-center gap-2">
            <CloseConversationDialog id={conversationId} description={`Seguro que desea cerrar la conversación de ${userEmail}?`} redirectUri={`/client/${slug}/simulator?r=${new Date().getMilliseconds()}`} /> 
          </div>
        </div>
        :
        <div className="flex items-center justify-end w-full my-5">        
          <CloseConversationDialog id={conversationId} description={`Seguro que desea cerrar la conversación de ${userEmail}?`} redirectUri={`/client/${slug}/simulator?r=${new Date().getMilliseconds()}`} />
        </div>
      }
        

      <div>
        {
          loading ? 
            <Loader className="animate-spin" /> :         
            <div className="text-center">
              <p className="text-lg font-bold">{userEmail}</p>
              {messages.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getFormatInTimezone(messages[messages.length -1].createdAt || new Date(), client?.timezone || "America/Montevideo")}
                </p>
              )}
            </div>
        }
        {
          totalPromptTokens > 0 && (
            <div className="flex items-center justify-center gap-2">
              <p>{Intl.NumberFormat("es-UY").format(totalPromptTokens)} pt</p>
              <p>+</p>
              <p>{Intl.NumberFormat("es-UY").format(totalCompletionTokens)} ct</p>
              <p>=</p>
              <p>{Intl.NumberFormat("es-UY").format(totalPromptTokens + totalCompletionTokens)} tokens</p>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <CircleDollarSign size={18} />
              <p>{Intl.NumberFormat("es-UY").format(promptTokensValue + completionTokensValue)} USD</p>
              {isAdmin && 
              <>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <CircleDollarSign size={18} />
                <p>{Intl.NumberFormat("es-UY").format(promptCostTokenValue + completionCostTokenValue)} USD (costo)</p>
              </>
              }
            </div>                  
          )
        }
      </div>

      <div className="w-full max-w-3xl mt-5">
        {messages.length > 0 ? (
          messages.map((message, i) => {
            // @ts-ignore
            const gptData= message.gptData
            return(
            <div key={i} className="w-full">
              <div
                className={clsx(
                  "flex w-full px-1 items-center justify-center border-b border-gray-200/50 dark:border-gray-700/50 py-6",
                  message.role === "user" ? "bg-gray-50 dark:bg-gray-800/50" : "bg-background",
                )}
              >
                <div className="flex items-start w-full max-w-screen-md px-5 gap-4 sm:px-0">
                  {
                    !gptData &&
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        message.role === "assistant" ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : 
                        (message.role === "system" || message.role === "function") ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : 
                        "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                      )}>
                        {message.role === "user" ? (
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : message.role === "system" ? (
                          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (message.role === "function" && !gptData) ? (
                          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                        ) : message.role === "assistant" ? (
                          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : 
                          <></>
                        }
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {getFormatWithTime(message.createdAt || new Date(), client?.timezone).primary}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {getFormatWithTime(message.createdAt || new Date(), client?.timezone).secondary}
                        </div>
                      </div>
                    </div>
                  }
                  {
                    message.role !== "system"  && !gptData &&
                    <ReactMarkdown
                      className="w-full mt-1 prose break-words prose-p:leading-relaxed dark:prose-invert"
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // open links in new tab
                        a: (props) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {sanitizeMarkdown(message.content)}
                    </ReactMarkdown>            
                  }


                </div>                         
                {
                  // @ts-ignore
                  message.promptTokens > 0 && (
                    <div className="grid p-2 text-right border rounded-md">
                      {/** @ts-ignore */}
                      <p className="whitespace-nowrap">{Intl.NumberFormat("es-UY").format(message.promptTokens)} pt</p>
                      {/** @ts-ignore */}
                      <p>{Intl.NumberFormat("es-UY").format(message.completionTokens)} ct</p>
                    </div>
                  )
                }

              </div>
              { 
                gptData && isAdmin && (
                  // @ts-ignore
                  <div className="mb-6"><GPTData gptData={message.gptData} slug={slug} /></div>
                )
              }              
            </div>

            
          )})
        ) : client?.nombre && (
          <div className="max-w-screen-md mx-5 border rounded-md border-gray-200sm:mx-0 sm:w-full">
            <div className="flex flex-col space-y-4 p-7 sm:p-10">
              <h1 className="text-lg font-semibold">
                Bienvenido al asistente de {client?.nombre}!
              </h1>
              <p className="text-gray-500">
                Este es un simulador de conversaciones.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-10 text-base text-center text-red-500">{error.message}</p>}

      {
        customInfo?.conversationLLMOff &&
        <Button onClick={handleLLMOn} className="gap-2 mt-10">
          { loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          <p>Habilitar LLM</p>
        </Button>
      }

      <div className="fixed bottom-0 flex flex-col items-center w-full p-5 pb-3 space-y-3 max-w-[350px] sm:max-w-[400px] md:max-w-[550px] lg:max-w-screen-md sm:px-0 bg-background">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full px-4 pt-3 pb-2 border border-gray-200 shadow-lg rounded-xl sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder={customInfo?.conversationLLMOff ? "LLMOff" : "Escribe aquí"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none bg-background"
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-4 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all bg-background",
              disabled || customInfo?.conversationLLMOff
                ? "cursor-not-allowed"
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

        <div className="grid w-full grid-cols-3">
          <div>
          {customInfo?.summitId &&
            <Link href={`/client/summit/summit?summitId=${customInfo.summitId}`}>
              <Button variant="ghost" className="h-3"><Ticket /></Button>
            </Link>
          }
          {customInfo?.carServiceName &&
            <Link href={`/client/${slug}/car-service?name=${customInfo.carServiceName}`}>
              <Button variant="ghost" className="h-3"><Car /></Button>
            </Link>
          }
          
          </div>
          <p className="text-xs text-center text-gray-400">
            Creado por {" "}
            <a
              href="https://www.osomdigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-black dark:hover:text-white"
            >            
              Osom Digital
            </a>
          </p>
          <p></p>
        </div>
      </div>

    </main>
  );
}
