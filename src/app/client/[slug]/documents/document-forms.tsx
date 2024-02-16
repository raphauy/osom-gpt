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

type Props= {
  id?: string
  clientId: string
  closeDialog: () => void
}

export function DocumentForm({ id, clientId, closeDialog }: Props) {
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {},
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)

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
          form.setValue("description", data.description)
          form.setValue("clientId", data.clientId)
        }
      })
    }
    form.setValue("clientId", clientId)
  }, [form, id, clientId])

  return (
    <div className="p-4 bg-white rounded-md">
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
          
      
          

        <div className="flex justify-end">
            <Button onClick={() => closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <p>Save</p>}
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

