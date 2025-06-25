"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { ApiTokensPriceForm } from "./api-tokens-price-form"

interface Props{
  title: string
  trigger: React.ReactNode
  id: string
}

export function ApiTokensPriceDialog({ title, trigger, id }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ApiTokensPriceForm id={id} closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
} 