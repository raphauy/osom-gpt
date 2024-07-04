"use client"

import { useEffect, useState } from "react";
import { ArrowLeftRight, ChevronsLeft, ChevronsRight, Loader, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast";
import { RepositoryForm, DeleteRepositoryForm } from "./repository-forms"
import { getRepositoryDAOAction } from "./repository-actions"

export function RepositoryDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">
          <PlusCircle size={22} className="mr-2"/>
          Crear Repositorio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Repositorio</DialogTitle>
        </DialogHeader>
        <RepositoryForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
  
type DeleteProps= {
  id: string
  description: string
  withText: boolean
}

export function DeleteRepositoryDialog({ id, description, withText }: DeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      {
        withText ? 
        <Button variant="destructive">Eliminar Repositorio</Button>         
        :
        <Trash2 size={30} className="hover:cursor-pointer" />
      }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Repository</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteRepositoryForm closeDialog={() => setOpen(false)} id={id} redirect={withText} />
      </DialogContent>
    </Dialog>
  )
}

