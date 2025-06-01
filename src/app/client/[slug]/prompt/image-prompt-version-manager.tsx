"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { format, isThisWeek, isToday, isYesterday } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import PromptVersionList from './prompt-version-list'
import { ArrowUpCircle, Loader, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ImagePromptVersionDAO, ImagePromptVersionFormValues } from "@/services/prompt-version-services"
import { useSession } from "next-auth/react"
import { updateImagePromptAction, updateImagePromptAndCreateVersionAction } from "@/app/admin/clients/(crud)/actions"
import { toast } from "@/components/ui/use-toast"
import { deletePromptVersionAction } from "@/app/admin/promptversions/promptversion-actions"
import { cn } from "@/lib/utils"
import { toZonedTime } from "date-fns-tz"
import ImagePromptTester from "./image-prompt-tester"

type Props = {
  clientId: string
  timezone: string
  imagePrompt: string
  versions: ImagePromptVersionDAO[]
}
    
export default function ImagePromptVersionManager({ clientId, timezone, imagePrompt, versions }: Props) {
    const [loadingGuardar, setLoadingGuardar] = useState(false)
    const [loadingAplicar, setLoadingAplicar] = useState(false)
    const [currentImagePrompt, setCurrentImagePrompt] = useState("")
    const [selectedVersion, setSelectedVersion] = useState<ImagePromptVersionDAO | null>(null)

    const [charCountSaved, setCharCountSaved] = useState(0)
    const [charCount, setCharCount] = useState(0)
  
    const session = useSession()
    const currentUser = session?.data?.user?.name || session?.data?.user?.email

    useEffect(() => {        
        const count= imagePrompt.length
        setCharCount(count)
        setCharCountSaved(count)
        setCurrentImagePrompt(imagePrompt)
    }, [imagePrompt])

    const saveVersion = () => {
        setLoadingGuardar(true)
        const newVersion: ImagePromptVersionFormValues = {
        content: currentImagePrompt,
        user: currentUser as string,
        clientId: clientId,
        type: "image"
        }
        
        updateImagePromptAndCreateVersionAction(newVersion)
        .then(() => {
            toast({ title: "Versión de image prompt guardada" })
            setCharCountSaved(charCount)
            setSelectedVersion(null)
        })
        .catch(() => {
            toast({ title: "Error", description: "Error al guardar la versión del image prompt" })
        })
        .finally(() => {
            setLoadingGuardar(false)
        })
    }

    const deleteVersion = (id: string) => {
        setLoadingGuardar(true)
        deletePromptVersionAction(id)
        .then(() => {
        toast({title: "Versión eliminada" })
        })
        .catch((error) => {
        toast({title: "Error", description: error.message, variant: "destructive"})
        })
        .finally(() => {
        setLoadingGuardar(false)
        })
    }

    const handleUseVersion = (version: ImagePromptVersionDAO) => {
        setCurrentImagePrompt(version.content)
        setLoadingAplicar(true)
        const versionData: ImagePromptVersionFormValues = {
            content: version.content,
            user: version.user,
            clientId: version.clientId,
            type: "image"
        }
        updateImagePromptAction(versionData)
        .then(() => {
            toast({title: "Image prompt actualizado"})
            const count= version.content.length
            setCharCount(count)
            setCharCountSaved(count)
        })
        .catch(() => {
            toast({title: "Error", description: "Error al actualizar el image prompt", variant: "destructive"})
        })
        .finally(() => {
            setLoadingAplicar(false)
        })
    }

    const viewVersion = (version: ImagePromptVersionDAO) => {
        setSelectedVersion(version)
    }

    if (!currentUser) {
        return <div>Usuario no encontrado</div>
    }


    return (
        <div className="w-full p-4 flex flex-col h-full">
        <div className="space-y-2 mb-4">
            <Textarea
                value={currentImagePrompt}
                placeholder="Escribe tu prompt para procesamiento de imágenes aquí..."
                className="w-full min-h-[300px]"
                onChange={(e) => {
                    const text = e.target.value
                    setCharCount(text.length)
                    setCurrentImagePrompt(text)
                  }}
            />
            <div className="flex justify-end gap-2">
            <ImagePromptTester currentPrompt={currentImagePrompt} />
            <Button 
                onClick={saveVersion} 
                className={cn("w-auto px-6", {
                    "opacity-50 cursor-not-allowed": charCountSaved === charCount
                })}
                disabled={charCountSaved === charCount}
            >
                {loadingGuardar ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Guardar prompt
            </Button>
            </div>
        </div>

        <Separator className="my-4"/>

        <div className="flex gap-4 flex-grow min-h-[400px]">
            <div className="w-96 flex flex-col h-full">
            <div className="h-14 flex items-center px-2">
                <h2 className="text-lg font-semibold">Historial de Versiones</h2>
            </div>
            <div className="flex-grow border rounded-md overflow-hidden">
                <PromptVersionList
                versions={versions}
                timezone={timezone}
                selectedVersion={selectedVersion}
                currentPrompt={currentImagePrompt}
                onViewVersion={viewVersion}
                onUseVersion={handleUseVersion}
                onDeleteVersion={deleteVersion}
                />
            </div>
            </div>
            <div className="w-full flex flex-col h-full">
            <div className="h-14 flex items-center justify-between px-2">
                {selectedVersion && (
                    <>
                        <h2 className="text-lg font-semibold">{selectedVersion.user} - {format(toZonedTime(selectedVersion.timestamp, timezone), "dd/MM/yyyy HH:mm:ss")}</h2>
                        <Button onClick={() => handleUseVersion(selectedVersion)} disabled={loadingAplicar}>
                            {loadingAplicar ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <ArrowUpCircle className="mr-2 h-5 w-5" />}
                            Aplicar esta versión
                        </Button>
                    </>
                )}
            </div>
            <div className="flex-grow border rounded-md overflow-hidden">
                <ScrollArea className="h-full max-h-[500px]">
                <div className="p-4">
                    {selectedVersion ? (
                        <p className="whitespace-pre-wrap">{selectedVersion.content}</p>
                    ) : (
                    <p className="text-muted-foreground">Selecciona una versión para ver su contenido</p>
                    )}
                </div>
                </ScrollArea>
            </div>
            </div>
        </div>
        </div>
    )
} 