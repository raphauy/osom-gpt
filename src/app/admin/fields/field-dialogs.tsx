"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteFieldForm, FieldForm } from "./field-forms";

type Props= {
  id?: string
  repoId: string
}

const addTrigger= <Button variant="outline"><PlusCircle size={22} className="mr-2"/>Crear campo</Button>
const updateTrigger= <Pencil size={30} className="pr-2 hover:cursor-pointer"/>

export function FieldDialog({ id, repoId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {id ? updateTrigger : addTrigger }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Actualizar' : 'Crear'} campo
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <FieldForm closeDialog={() => setOpen(false)} id={id} repoId={repoId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
  
type DeleteProps= {
  id: string
  description: string
}

export function DeleteFieldDialog({ id, description }: DeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2 className="hover:cursor-pointer"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Field</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteFieldForm closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  )
}

interface CollectionProps{
  id: string
  title: string
}




  
