"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Reorder } from "framer-motion"
import { Asterisk, Grip, Loader, X } from "lucide-react"
import { useEffect, useState } from "react"
import { FieldDAO } from "@/services/field-services"
import { deleteFieldAction, updateOrderAction } from "../../fields/field-actions"
import { FieldDialog } from "../../fields/field-dialogs"
import { Badge } from "@/components/ui/badge"

type Props= {
    initialFields: FieldDAO[]
    repoId: string
}
export default function FieldsBox({ initialFields, repoId }: Props) {

    const [fields, setFields] = useState(initialFields)
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        setFields(initialFields)
    }, [initialFields])    

    function handleNewOrder(newOrder: FieldDAO[]) {
        updateOrderAction(newOrder)
        .then(() => {
            setFields(newOrder)
        })
        .catch((error) => {
            toast({title: "Error", description: "Error al actualizar el orden de las notas", variant: "destructive"})
        })
    }

    function handleDelete(id: string) {
        setLoading(true)
        setDeletingId(id)
        deleteFieldAction(id)
        .then(() => {
          toast({ title: "Campo eliminado" })
          setFields(fields.filter((note) => note.id !== id))
        })
        .catch((error) => {
          toast({title: "Error", description: error.message, variant: "destructive"})
        })
        .finally(() => {
          setLoading(false)
          setDeletingId(null)
        })
    }
    return (
        <Reorder.Group values={fields} onReorder={(newOrder) => handleNewOrder(newOrder)} className="">
            <div className="flex justify-end">
                <FieldDialog repoId={repoId} />
            </div>
        {
            fields.map((field, index) => {
                return (
                    <Reorder.Item key={field.id} value={field} className="bg-white rounded-lg dark:bg-slate-800 border mt-2 flex items-center justify-between w-full text-muted-foreground border-b hover:bg-slate-50 min-h-12 px-2">
                        <div className="flex items-center cursor-pointer w-full h-11">
                            <Grip className="w-5 h-5 text-gray-500" />
                            <p className="whitespace-pre-line ml-2">{field.name}</p>
                            { field.required && <Asterisk className="w-5 h-5 text-green-500" /> }
                        </div>
                        <div className="flex items-center">
                            <Badge className="mr-3">
                                {field.type}
                            </Badge>
                            <FieldDialog repoId={field.repositoryId} id={field.id} />
                            {/* <DeleteCotizationNoteDialog id={note.id} description={`seguro que quieres eliminar la nota ${note.text}?`} /> */}
                            {
                                loading && deletingId === field.id ? <Loader className="h-5 w-5 animate-spin" />
                                : 
                                <Button variant="ghost" className="px-1" onClick={() => handleDelete(field.id)}>
                                    <X className="w-5 h-5 text-red-500" />
                                </Button>
                            }
                        </div>
                    </Reorder.Item>
                        )
            })
        }
        </Reorder.Group>
    )
}
