"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { getCloneProgress } from "./clone-actions"
import { type CloneProgress as CloneProgressType } from "@/services/client-cloning-service"

interface CloneProgressProps {
  jobId: string
  onComplete: (result: any) => void
  onCancel?: () => void
}

export function CloneProgress({ jobId, onComplete, onCancel }: CloneProgressProps) {
  const [progress, setProgress] = useState<CloneProgressType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    let isActive = true
    let intervalId: NodeJS.Timeout | null = null

    const pollProgress = async () => {
      if (!isActive) return
      
      try {
        const data = await getCloneProgress(jobId)
        
        if (!isActive) return
        
        setProgress(data)

        if (data.status === "completed" && data.result) {
          onComplete({
            newClientId: data.result.newClientId,
            newClientSlug: data.result.newClientSlug,
            newClientName: data.result.newClientName
          })
        } else if (data.status === "failed") {
          setError(data.error || "Error desconocido durante la clonación")
        }
        
        // Continuar polling si está procesando
        if (data.status === "processing" || data.status === "pending") {
          intervalId = setTimeout(pollProgress, 500)
        }
      } catch (error) {
        if (!isActive) return
        console.error("Error al obtener progreso:", error)
        setError(error instanceof Error ? error.message : "Error al obtener progreso")
      }
    }

    // Polling inicial inmediato
    pollProgress()

    return () => {
      isActive = false
      if (intervalId) clearTimeout(intervalId)
    }
  }, [jobId, onComplete])

  if (!progress) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepTextClass = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "processing":
        return "text-blue-600 font-medium"
      case "failed":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso de clonación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso total</span>
              <span className="font-medium">{progress.progress.percentage}%</span>
            </div>
            <Progress value={progress.progress.percentage} className="h-3" indicatorColor="bg-primary" />
          </div>
          
          {progress.currentStep && (
            <p className="text-sm text-muted-foreground animate-pulse">
              {progress.currentStep}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de pasos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pasos de clonación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {getStepIcon(step.status)}
                
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${getStepTextClass(step.status)}`}>
                    {step.name}
                  </p>
                  
                  {step.itemsTotal && step.itemsTotal > 0 && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(step.itemsProcessed || 0) / step.itemsTotal * 100} 
                        className="h-1.5 flex-1"
                        indicatorColor="bg-primary"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {step.itemsProcessed || 0} / {step.itemsTotal}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de error si falla */}
      {error && (
        <div className="space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base text-red-800">Error en la clonación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
          {onCancel && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cerrar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Información adicional o botón de cerrar si falló */}
      {progress.status === "processing" && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Por favor, no cierres esta ventana mientras se completa la clonación.
          </p>
        </div>
      )}
      
      {progress.status === "failed" && onCancel && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )
}