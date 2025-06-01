"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Loader, Play, Image as ImageIcon, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { testImagePromptAction } from "@/app/admin/clients/(crud)/actions"

type Props = {
  currentPrompt: string
}

type TestResult = {
  description: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export default function ImagePromptTester({ currentPrompt }: Props) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [imageError, setImageError] = useState(false)

  // Limpiar datos cuando se abre el dialog
  useEffect(() => {
    if (open) {
      resetTest()
    }
  }, [open])

  const testPrompt = async () => {
    if (!imageUrl.trim()) {
      toast({ title: "Error", description: "Por favor ingresa una URL de imagen", variant: "destructive" })
      return
    }

    if (!currentPrompt.trim()) {
      toast({ title: "Error", description: "El prompt está vacío", variant: "destructive" })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await testImagePromptAction(imageUrl.trim(), currentPrompt)
      
      if (response.success && response.data) {
        setResult(response.data)
        toast({ title: "¡Prompt probado exitosamente!" })
      } else {
        throw new Error(response.error || 'Error al procesar la imagen')
      }
    } catch (error) {
      console.error('Error testing prompt:', error)
      toast({ 
        title: "Error", 
        description: "Error al probar el prompt. Verifica que la URL de la imagen sea válida.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const resetTest = () => {
    setImageUrl("")
    setResult(null)
    setImageError(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <Play className="mr-2 h-4 w-4" />
          Probar prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Probar Prompt de Imagen
          </DialogTitle>
          <DialogDescription>
            Prueba tu prompt con una imagen para ver cómo funciona antes de guardarlo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Panel izquierdo - Configuración */}
          <div className="space-y-4 h-[600px] flex flex-col">
            {/* URL Input - altura fija */}
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="imageUrl">URL de la imagen</Label>
              <Input
                id="imageUrl"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Vista previa - altura fija */}
            <Card className="flex-shrink-0">
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
                {imageUrl ? (
                  !imageError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-md border"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-md border flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Error al cargar la imagen</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-48 bg-muted rounded-md border-2 border-dashed flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ingresa una URL para ver la vista previa</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prompt actual - altura controlada */}
            <div className="flex-1 min-h-0 flex flex-col space-y-2 mb-4">
              <Label>Prompt actual</Label>
              <Card className="flex-1">
                <CardContent className="p-3 h-full">
                  <ScrollArea className="h-full">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {currentPrompt || "No hay prompt configurado"}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Botones - altura fija en la parte inferior */}
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                onClick={testPrompt} 
                disabled={isLoading || !imageUrl.trim() || !currentPrompt.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Probar
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetTest} disabled={isLoading}>
                Limpiar
              </Button>
            </div>
          </div>

          {/* Panel derecho - Resultado */}
          <div className="h-[600px] flex flex-col space-y-4">
            <Label className="flex-shrink-0">Resultado</Label>
            <Card className="flex-1 min-h-0">
              <CardContent className="p-4 h-full flex flex-col">
                {result ? (
                  <>
                    <div className="flex-1 min-h-0">
                      <ScrollArea className="h-full">
                        <div className="pr-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                            {result.description}
                          </p>
                        </div>
                      </ScrollArea>
                    </div>
                    
                    {/* Información de usage */}
                    <div className="pt-4 border-t flex-shrink-0">
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="text-center">
                          <div className="font-medium">{result.usage.promptTokens}</div>
                          <div>Prompt tokens</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{result.usage.completionTokens}</div>
                          <div>Completion tokens</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{result.usage.totalTokens}</div>
                          <div>Total tokens</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    {isLoading ? (
                      <div className="space-y-2">
                        <Loader className="h-8 w-8 animate-spin mx-auto" />
                        <p>Analizando imagen...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-8 w-8 mx-auto opacity-50" />
                        <p>El resultado aparecerá aquí</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 