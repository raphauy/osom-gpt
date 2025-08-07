"use client"

import { FileText, Database, Code, GitBranch, Clock, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClonePreview } from "@/services/client-cloning-service"

interface ClonePreviewStatsProps {
  preview: ClonePreview
}

export function ClonePreviewStats({ preview }: ClonePreviewStatsProps) {
  const stats = [
    {
      icon: FileText,
      label: "Documentos",
      value: preview.itemsToClone.documents,
      subtitle: `${preview.itemsToClone.sections} secciones`,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      icon: Code,
      label: "Funciones",
      value: preview.itemsToClone.functions,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      icon: GitBranch,
      label: "Repositorios",
      value: preview.itemsToClone.repositories,
      subtitle: `${preview.itemsToClone.fields} campos`,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      icon: Database,
      label: "Versiones de Prompt",
      value: preview.itemsToClone.promptVersions,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ]

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} segundos`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const totalItems = preview.itemsToClone.documents + 
                    preview.itemsToClone.functions + 
                    preview.itemsToClone.repositories + 
                    preview.itemsToClone.promptVersions

  return (
    <div className="space-y-6">
      {/* Cliente origen */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{preview.source.name}</h3>
          <p className="text-sm text-muted-foreground">
            Slug: <code className="bg-muted px-1 py-0.5 rounded text-xs">{preview.source.slug}</code>
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Cliente Origen
        </Badge>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3 mx-auto`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  {stat.subtitle && (
                    <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Tiempo Estimado
              </h4>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              La clonación tardará aproximadamente <strong>{formatTime(preview.estimatedTime)}</strong>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-medium text-amber-900 dark:text-amber-100">
                Elementos Totales
              </h4>
            </div>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Se clonarán <strong>{totalItems} elementos principales</strong> y sus dependencias
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}