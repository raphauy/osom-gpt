"use client"

import { useEffect, useState } from "react";
import { ArrowLeftRight, ChevronsLeft, ChevronsRight, Copy, Loader, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast";
import { RepositoryForm, DeleteRepositoryForm, DuplicateRepositoryForm } from "./repository-forms"
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

type DuplicateProps= {
  duplicationRepoId: string
  duplicationName: string
}
export function DuplicateRepositoryDialog({ duplicationRepoId, duplicationName }: DuplicateProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 hover:bg-slate-100 hover:text-green-600 h-9 rounded-sm">
        <div className="flex items-center gap-2 hover:cursor-pointer px-2">
          <Copy className="mr-2"/>
          <p>Duplicar repositorio</p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar repositorio</DialogTitle>
        </DialogHeader>
        <DuplicateRepositoryForm closeDialog={() => setOpen(false)} duplicationRepoId={duplicationRepoId} duplicationName={duplicationName} />
      </DialogContent>
    </Dialog>
  )
}

export function DeleteRepoFromMenuDialog({ id, description, withText }: DeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 hover:bg-slate-100 hover:text-red-600 h-9 rounded-sm">
        <div className="flex items-center gap-2 hover:cursor-pointer px-2">
          <Trash2 size={25} className="text-red-400 mr-2"/>
          <p>Eliminar repositorio</p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar repositorio</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteRepositoryForm closeDialog={() => setOpen(false)} id={id} redirect={withText} />
      </DialogContent>
    </Dialog>
  )
}


