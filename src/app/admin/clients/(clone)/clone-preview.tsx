"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Database, FunctionSquare, Package, Layout, Clock } from "lucide-react"
import { type ClonePreview as ClonePreviewType } from "@/services/client-cloning-service"

interface ClonePreviewProps {
  preview: ClonePreviewType
  onContinue: () => void
  onBack: () => void
  onCancel?: () => void
}

export function ClonePreview({ preview, onContinue, onBack, onCancel }: ClonePreviewProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} segundos`
    const minutes = Math.floor(seconds / 60)
    return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`
  }

  const cards = [
    {
      icon: FileText,
      title: "Documentos",
      value: preview.itemsToClone.documents,
      description: `${preview.itemsToClone.sections} secciones`,
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: FunctionSquare,
      title: "Funciones",
      value: preview.itemsToClone.functions,
      description: "Funciones (no repo)",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Database,
      title: "Repositorios",
      value: preview.itemsToClone.repositories,
      description: `${preview.itemsToClone.fields} campos`,
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Layout,
      title: "Prompts",
      value: preview.itemsToClone.promptVersions,
      description: "Versiones de prompt",
      color: "text-orange-600 bg-orange-100"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Se clonará el cliente <span className="font-semibold">{preview.source.name}</span> con los siguientes elementos:
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{card.value}</span>
                  <span className="text-sm text-muted-foreground">{card.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Tiempo estimado</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            {formatTime(preview.estimatedTime)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            El tiempo puede variar según el volumen de datos
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
        <Button onClick={onContinue}>
          Continuar con la configuración
        </Button>
      </div>
    </div>
  )
}