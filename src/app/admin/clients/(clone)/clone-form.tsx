"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type CloneClientData } from "@/services/client-cloning-service"
import { getSuggestedName } from "./clone-actions"

interface CloneFormProps {
  sourceClient: {
    id: string
    name: string
    slug: string
  }
  itemsToClone: {
    documents: number
    sections: number
    functions: number
    repositories: number
    fields: number
    promptVersions: number
  }
  onSubmit: (data: Omit<CloneClientData, "sourceClientId">) => void
  onBack: () => void
  onCancel?: () => void
}

export function CloneForm({ sourceClient, itemsToClone, onSubmit, onBack, onCancel }: CloneFormProps) {
  const [newName, setNewName] = useState("")
  const [includeDocuments, setIncludeDocuments] = useState(true)
  const [includeFunctions, setIncludeFunctions] = useState(true)
  const [includeRepositories, setIncludeRepositories] = useState(true)
  const [includePromptHistory, setIncludePromptHistory] = useState(false)
  const [loadingSuggestedName, setLoadingSuggestedName] = useState(false)

  // Sugerir nombre automáticamente
  useEffect(() => {
    if (sourceClient) {
      setLoadingSuggestedName(true)
      getSuggestedName(sourceClient.name)
        .then(suggestedName => {
          setNewName(suggestedName)
        })
        .catch(error => {
          console.error("Error al obtener nombre sugerido:", error)
          // Fallback al nombre simple si hay error
          setNewName(`${sourceClient.name}-copia`)
        })
        .finally(() => {
          setLoadingSuggestedName(false)
        })
    }
  }, [sourceClient])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newName.trim()) {
      return
    }

    onSubmit({
      newName: newName.trim(),
      includeDocuments,
      includeFunctions,
      includeRepositories,
      includePromptHistory
    })
  }

  const isValid = newName.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Configuración para la copia de <span className="font-semibold">{sourceClient.name}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newName">Nombre del nuevo cliente</Label>
          <Input
            id="newName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={loadingSuggestedName ? "Obteniendo nombre sugerido..." : "Ingrese el nombre del nuevo cliente"}
            required
            className="font-medium"
            disabled={loadingSuggestedName}
          />
          <p className="text-xs text-muted-foreground">
            El sistema generará automáticamente un slug único basado en este nombre
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elementos a incluir</CardTitle>
          <CardDescription>
            Selecciona qué elementos deseas copiar al nuevo cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="documents"
                checked={includeDocuments}
                onCheckedChange={setIncludeDocuments}
              />
              <Label
                htmlFor="documents"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Documentos y secciones
              </Label>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{itemsToClone.documents} docs</Badge>
              <Badge variant="secondary">{itemsToClone.sections} secciones</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="functions"
                checked={includeFunctions}
                onCheckedChange={setIncludeFunctions}
              />
              <Label
                htmlFor="functions"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Funciones (no repo)
              </Label>
            </div>
            <Badge variant="secondary">{itemsToClone.functions} funciones</Badge>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="repositories"
                checked={includeRepositories}
                onCheckedChange={setIncludeRepositories}
              />
              <Label
                htmlFor="repositories"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Repositorios y campos
              </Label>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{itemsToClone.repositories} repos</Badge>
              <Badge variant="secondary">{itemsToClone.fields} campos</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="promptHistory"
                checked={includePromptHistory}
                onCheckedChange={setIncludePromptHistory}
              />
              <Label
                htmlFor="promptHistory"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Historial de prompts
              </Label>
            </div>
            <Badge variant="secondary">{itemsToClone.promptVersions} versiones</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> No se copiarán las conversaciones, usuarios, ni datos de uso de API. El nuevo cliente comenzará con un historial limpio.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
        <Button type="submit" disabled={!isValid}>
          Iniciar Clonación
        </Button>
      </div>
    </form>
  )
}