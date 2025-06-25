"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { LoadingSpinnerChico } from "@/components/loadingSpinner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { getDataClient } from "../../clients/(crud)/actions"
import { setApiTokensPriceAction } from "./actions"


const formSchema = z.object({  
  imagePromptTokensPrice: z.coerce.number(),
  imageCompletionTokensPrice: z.coerce.number(),
  audioSecondsPrice: z.coerce.number(),
  embeddingTokensPrice: z.coerce.number(),
  clienteId: z.string().optional(),
})

export type ApiTokensPriceFormValues = z.infer<typeof formSchema>

const defaultValues: Partial<ApiTokensPriceFormValues> = {}

interface Props{
  id: string
  closeDialog: () => void
}

export function ApiTokensPriceForm({ id, closeDialog }: Props) {
  const form = useForm<ApiTokensPriceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit(data: ApiTokensPriceFormValues) {
    setLoading(true)

    setApiTokensPriceAction(
      id, 
      data.imagePromptTokensPrice, 
      data.imageCompletionTokensPrice,
      data.audioSecondsPrice,
      data.embeddingTokensPrice
    )
    .then((res) => {
      toast({title: "Se guardaron los precios de APIs" })
      window.location.reload()
      closeDialog()
    })
    .catch((err) => {
      toast({title: "Error al guardar los precios de APIs" })
    })
    .finally(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    getDataClient(id).then((data) => {
      if (!data) return
      
      // Set form values from client data
      form.setValue("imagePromptTokensPrice", data.imagePromptTokensPrice || 0)
      form.setValue("imageCompletionTokensPrice", data.imageCompletionTokensPrice || 0)
      form.setValue("audioSecondsPrice", data.audioSecondsPrice || 0)
      form.setValue("embeddingTokensPrice", data.embeddingTokensPrice || 0)
    })
  }, [form, id])

  return (
    <div className="p-4 rounded-md">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4 pb-4 border-b">
          <h3 className="text-lg font-medium">Precios API de Imágenes</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="imagePromptTokensPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio 1M Prompt Tokens (USD)</FormLabel>
                  <FormControl>
                    <Input placeholder="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageCompletionTokensPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio 1M Completion Tokens (USD)</FormLabel>
                  <FormControl>
                    <Input placeholder="16" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mb-4 pb-4 border-b">
          <h3 className="text-lg font-medium">Precio API de Audio</h3>
          <FormField
            control={form.control}
            name="audioSecondsPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio por Segundo de Audio (USD)</FormLabel>
                <FormControl>
                  <Input placeholder="0.006" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-4 pb-4 border-b">
          <h3 className="text-lg font-medium">Precio API de Embeddings</h3>
          <FormField
            control={form.control}
            name="embeddingTokensPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio 1M Token de Embedding (USD)</FormLabel>
                <FormControl>
                  <Input placeholder="0.0001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => closeDialog()} type="button" variant={"secondary"} className="w-32">Cancelar</Button>
          <Button variant="outline" type="submit" className="w-32 ml-2" >{loading ? <LoadingSpinnerChico /> : <p>Guardar</p>}</Button>
        </div>
      </form>
    </Form>
   </div>
 )
} 