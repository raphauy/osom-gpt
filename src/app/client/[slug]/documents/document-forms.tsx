"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { deleteDocumentAction, createOrUpdateDocumentAction, getDocumentDAOAction } from "./document-actions"
import { documentSchema, DocumentFormValues } from '@/services/document-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

type Props= {
  id?: string
  clientId: string
  closeDialog: () => void
}

export function DocumentForm({ id, clientId, closeDialog }: Props) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      automaticDescription: true,
      description: "",
    },
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)
  // use the watch of the form to get the value of the automaticDescription field
  const automaticDescription = form.watch("automaticDescription")

  const onSubmit = async (data: DocumentFormValues) => {
    setLoading(true)
    try {
      await createOrUpdateDocumentAction(id ? id : null, data)
      toast({ title: id ? "Document updated" : "Document created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getDocumentDAOAction(id).then((data) => {
        if (data) {
          form.setValue("name", data.name)
          form.setValue("automaticDescription", data.automaticDescription)
          form.setValue("description", data.description)
          form.setValue("clientId", data.clientId)
        }
      })
    }
    form.setValue("clientId", clientId)
  }, [form, id, clientId])

  return (
    <div className="p-4 rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del documento</FormLabel>
                <FormControl>
                  <Input placeholder="ej: Detalles del viaje a Portugal" {...field} />
                </FormControl>
                <FormDescription>Cuanto más descriptivo el nombre mejor para la IA</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="automaticDescription"
            render={({ field }) => (
              <FormItem className="pt-10">
                <FormLabel>Descripción automática</FormLabel>
                  <div className="flex items-center gap-2 border rounded-md p-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <FormDescription>Si está marcado, la descripción se generará automáticamente una vez el documento tenga información</FormDescription>
                    </div>
                  </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormDescription className={cn(!automaticDescription && "hidden")}>
            <span className="font-bold">Nota:</span> Esta descripción será utilizada para seleccionar información relevante para la IA entre todos los documentos.  
          </FormDescription>
      
          <div className={cn(automaticDescription && "hidden")}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={10} placeholder="ej: En este documento se detallan los paseos del viaje a Portugal, así como los hoteles involucrados" {...field} />
                  </FormControl>
                  <FormDescription>Esta descripción será utilizada para seleccionar información relevante para la IA entre todos los documentos.</FormDescription>
                  <FormDescription>No es información que le llegará al usuario, pero es muy importante para poder filtrar los documentos relevantes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />            
          </div>
          
        <div className="flex justify-end">
            <Button onClick={() => closeDialog()} type="button" variant={"secondary"} className="w-32">Cancelar</Button>
            <Button type="submit" className="w-32 ml-2" variant="outline">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <p>Guardar</p>}
            </Button>
          </div>
        </form>
      </Form>
    </div>     
  )
}

type DeleteProps= {
  id: string
  closeDialog: () => void
}

export function DeleteDocumentForm({ id, closeDialog }: DeleteProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    deleteDocumentAction(id)
    .then(() => {
      toast({title: "Document deleted" })
    })
    .catch((error) => {
      toast({title: "Error", description: error.message, variant: "destructive"})
    })
    .finally(() => {
      setLoading(false)
      closeDialog && closeDialog()
    })
  }
  
  return (
    <div>
      <Button onClick={() => closeDialog && closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
      <Button onClick={handleDelete} variant="destructive" className="w-32 gap-1 ml-2">
        { loading && <Loader className="w-4 h-4 animate-spin" /> }
        Delete  
      </Button>
    </div>
  )
}

