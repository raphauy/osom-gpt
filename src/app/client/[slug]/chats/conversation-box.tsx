import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { removeSectionTexts, getFormatWithTime } from "@/lib/utils"
import clsx from "clsx"
import { Bot, Car, CircleDollarSign, Cog, Loader, Terminal, Ticket, Unplug, User } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { DeleteConversationDialog } from "./(delete-conversation)/delete-dialogs"
import { DataConversation } from "./actions"
import GPTData from "./gpt-data"
import { useEffect, useState } from "react"
import { CustomInfo, getCustomInfoAction } from "@/app/admin/chat/actions"
import { useParams } from "next/navigation"
import { setLLMOffAction } from "../simulator/actions"
import { toast } from "@/components/ui/use-toast"
import { sanitizeMarkdown } from "@/lib/utils"

interface Props {
  conversation: DataConversation
  promptTokensPrice: number
  completionTokensPrice: number
  isAdmin: boolean
  showSystem: boolean
  setShowSystem: (showSystem: boolean) => void
}
  
export default function ConversationBox({ conversation, promptTokensPrice, completionTokensPrice, isAdmin, showSystem, setShowSystem}: Props) {

  const params= useParams()
  const slug= params.slug as string
  
  const totalPromptTokens= conversation.messages.reduce((acc, message) => acc + message.promptTokens, 0)
  const totalCompletionTokens= conversation.messages.reduce((acc, message) => acc + message.completionTokens, 0)
  const promptTokensValue= totalPromptTokens / 1000 * promptTokensPrice
  const completionTokensValue= totalCompletionTokens / 1000 * completionTokensPrice

  const messages= showSystem && isAdmin ? conversation.messages : conversation.messages.filter(message => message.role !== "system")

  const [customInfo, setCustomInfo] = useState<CustomInfo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCustomInfoAction(conversation.id)
    .then((customInfo) => {
      if (customInfo) {
        setCustomInfo(customInfo)
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }, [conversation.id])
  
  function handleLLMOn() {
    setLoading(true)
    setLLMOffAction(conversation.id, false)
    .then(() => {
      conversation.llmOff= false
      toast({ title: "LLM habilitado" })
    })
    .catch((err) => {
      toast({ title: "Error al habilitar LLM", description: err.message, variant: "destructive" })
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
      <main className="flex flex-col items-center justify-between w-full p-3 border-l">
        <div className="flex justify-between w-full pb-2 text-center border-b">
          <div className="place-self-end">
            {customInfo?.summitId &&
              <Link href={`/client/summit/summit?summitId=${customInfo.summitId}`}>
                <Button variant="ghost" className="h-7"><Ticket /></Button>
              </Link>
            }
            {customInfo?.carServiceName &&
              <Link href={`/client/${slug}/car-service?name=${customInfo.carServiceName}`}>
                <Button variant="ghost" className="h-7"><Car /></Button>
              </Link>
            }
            {
              conversation.llmOff &&
              <Button variant="outline" className="h-8 px-2" onClick={handleLLMOn}>
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
              </Button>
            }
          </div>
          <div>
            <div className="text-center">
              <p className="text-lg font-bold">{conversation.celular}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.fecha}</p>
            </div>
            {
              totalPromptTokens > 0 && isAdmin && (
                <div className="flex items-center justify-center gap-2">
                  <p>{Intl.NumberFormat("es-UY").format(totalPromptTokens)} pt</p>
                  <p>+</p>
                  <p>{Intl.NumberFormat("es-UY").format(totalCompletionTokens)} ct</p>
                  <p>=</p>
                  <p>{Intl.NumberFormat("es-UY").format(totalPromptTokens + totalCompletionTokens)} tokens</p>
                  <Separator orientation="vertical" className="h-6 mx-1" />
                  <CircleDollarSign size={18} />
                  <p>{Intl.NumberFormat("es-UY").format(promptTokensValue + completionTokensValue)} USD</p>
                </div>                  
              )
            }
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && 
              <>
                <p>Prompt:</p><Switch checked={showSystem} onCheckedChange={setShowSystem} />
                <DeleteConversationDialog id={conversation.id} description={`Seguro que desea eliminar la conversación de ${conversation.celular}`} redirectUri={`${conversation.clienteSlug}`} />
              </>
            }
          </div>          
        </div>  

        <div className="w-full max-w-3xl mt-5 ">
        {
          messages.map((message, i) => (
            <div key={i} className="w-full">
              <div className={clsx(
                  "flex w-full items-center justify-between px-1 lg:px-4 border-b border-gray-200/50 dark:border-gray-700/50 py-6",
                  message.role === "user" ? "bg-gray-50 dark:bg-gray-800/50" : "bg-background",
                )}
              >
                <div className="flex items-start w-full max-w-screen-md px-5 gap-4 sm:px-0">
                  {
                    // @ts-ignore
                    !message.gptData &&
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center border",
                        message.role === "assistant" ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : 
                        (message.role === "system" || message.role === "function") ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : 
                        "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                      )}>
                        {message.role === "user" ? (
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : message.role === "system" || message.role === "function" ? (
                          <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {getFormatWithTime(message.updatedAt).primary}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {getFormatWithTime(message.updatedAt).secondary}
                        </div>
                      </div>
                    </div>
                  }
                  {message.role === "system" ?
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="Prompt">
                      <AccordionTrigger>Prompt</AccordionTrigger>
                      <AccordionContent>
                        <div className="whitespace-pre-line">
                          {removeSectionTexts(message.content)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion> :
                    <div className="w-full">
                      {
                        // @ts-ignore
                        message.role != "system" &&
                        // message.role != "system" && message.role != "function" &&
                        <ReactMarkdown                        
                          className="prose break-words prose-p:leading-relaxed dark:prose-invert"
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
                }
                </div>
                {
                  message.promptTokens > 0 && isAdmin ? (
                    <div className="grid p-2 text-right border rounded-md">
                      <p className="whitespace-nowrap">{Intl.NumberFormat("es-UY").format(message.promptTokens)} pt</p>
                      <p>{Intl.NumberFormat("es-UY").format(message.completionTokens)} ct</p>
                    </div>
                  ) : 
                  <div></div>
                }
              </div>
              {
                message.gptData && isAdmin && (
                  <GPTData gptData={message.gptData} slug={conversation.clienteSlug} />
                )
              }              
            </div>
          ))
        }
        </div>

      </main>
    );
  }


