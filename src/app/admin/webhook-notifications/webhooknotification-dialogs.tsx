"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteWebhookNotificationForm, WebhookNotificationForm } from "./webhooknotification-forms";

type Props= {
  id?: string
}

const addTrigger= <Button><PlusCircle size={22} className="mr-2"/>Create WebhookNotification</Button>
const updateTrigger= <Pencil size={30} className="pr-2 hover:cursor-pointer"/>

export function WebhookNotificationDialog({ id }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {id ? updateTrigger : addTrigger }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Update' : 'Create'} WebhookNotification
          </DialogTitle>
        </DialogHeader>
        <WebhookNotificationForm closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  )
}
  
type DeleteProps= {
  id: string
  description: string
}

export function DeleteWebhookNotificationDialog({ id, description }: DeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2 className="hover:cursor-pointer"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete WebhookNotification</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteWebhookNotificationForm closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  )
}

interface CollectionProps{
  id: string
  title: string
}




  
