"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { ClonePreview } from "./clone-preview"
import { CloneForm } from "./clone-form"
import { CloneProgress } from "./clone-progress"
import { initiateClone, getClonePreview } from "./clone-actions"
import { ClientSelectorModal } from "./client-selector-modal"
import { type CloneClientData } from "@/services/client-cloning-service"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type CloneStep = "select" | "preview" | "configure" | "processing" | "complete"

interface CloneDialogProps {
  clients: Array<{ id: string; name: string; slug: string }>
}

export function CloneDialog({ clients }: CloneDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<CloneStep>("select")
  const [sourceClientId, setSourceClientId] = useState("")
  const [sourceClientName, setSourceClientName] = useState("")
  const [preview, setPreview] = useState<any>(null)
  const [jobId, setJobId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSelectClient = async (clientId: string, clientName: string) => {
    setSourceClientId(clientId)
    setSourceClientName(clientName)
    setLoading(true)
    
    try {
      const previewData = await getClonePreview(clientId)
      setPreview(previewData)
      setStep("preview")
    } catch (error) {
      console.error("Error al obtener preview:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener la vista previa del cliente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartClone = async (formData: Omit<CloneClientData, "sourceClientId">) => {
    setStep("processing")
    
    try {
      const result = await initiateClone({
        sourceClientId,
        ...formData
      })
      setJobId(result.jobId)
    } catch (error) {
      console.error("Error al iniciar clonación:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al iniciar la clonación",
        variant: "destructive"
      })
      setStep("configure")
    }
  }

  const handleComplete = (result: any) => {
    setStep("complete")
    toast({
      title: "¡Clonación exitosa!",
      description: `Cliente "${result.newClientName}" creado con éxito`,
    })
    // Recargar la página para mostrar el nuevo cliente
    router.refresh()
  }

  const resetModal = () => {
    setStep("select")
    setSourceClientId("")
    setSourceClientName("")
    setPreview(null)
    setJobId("")
    setLoading(false)
  }

  // Reset cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      resetModal()
    }
  }, [open])

  const getStepTitle = () => {
    switch (step) {
      case "select":
        return "Seleccionar Cliente a Clonar"
      case "preview":
        return "Vista Previa de Clonación"
      case "configure":
        return "Configurar Nueva Copia"
      case "processing":
        return "Clonando Cliente..."
      case "complete":
        return "¡Clonación Completada!"
      default:
        return "Clonar Cliente"
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="mr-2"
      >
        <Copy className="mr-2 h-4 w-4" />
        Clonar Cliente
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="w-[90vw] max-w-4xl h-[70vh] overflow-hidden flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{getStepTitle()}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && step === "select" && (
              <div className="flex flex-col h-full p-4">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Selecciona el cliente que deseas clonar. Se copiarán todos sus documentos, funciones y configuraciones.
                  </p>
                </div>
                <div className="flex-1 min-h-0">
                  <ClientSelectorModal
                    clients={clients}
                    value={sourceClientId}
                    onChange={handleSelectClient}
                  />
                </div>
                <div className="flex justify-end pt-4 mt-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOpen(false)
                      resetModal()
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {!loading && step === "preview" && preview && (
              <div className="h-full overflow-y-auto">
                <ClonePreview
                  preview={preview}
                  onContinue={() => setStep("configure")}
                  onBack={() => setStep("select")}
                  onCancel={() => {
                    setOpen(false)
                    resetModal()
                  }}
                />
              </div>
            )}

            {!loading && step === "configure" && (
              <div className="h-full overflow-y-auto">
                <CloneForm
                  sourceClient={preview?.source}
                  itemsToClone={preview?.itemsToClone}
                  onSubmit={handleStartClone}
                  onBack={() => setStep("preview")}
                  onCancel={() => {
                    setOpen(false)
                    resetModal()
                  }}
                />
              </div>
            )}

            {step === "processing" && (
              <div className="h-full overflow-y-auto">
                <CloneProgress
                  jobId={jobId}
                  onComplete={handleComplete}
                  onCancel={() => {
                    setOpen(false)
                    resetModal()
                  }}
                />
              </div>
            )}

            {step === "complete" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      ¡Clonación completada exitosamente!
                    </h3>
                    <p className="text-muted-foreground">
                      El nuevo cliente ha sido creado y está listo para usar.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => {
                      setOpen(false)
                      resetModal()
                    }}
                    className="min-w-[120px]"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}