"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ControllerRenderProps, useForm } from "react-hook-form"
import * as z from "zod"

import { LoadingSpinnerChico } from "@/components/loadingSpinner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { toast } from "@/components/ui/use-toast"
import { User } from "@prisma/client"
import { useEffect, useState, useMemo } from "react"
import { Search, ChevronsUpDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDataUser } from "./actions"
import { DataClient, getDataClients } from "../../clients/(crud)/actions"
import { get } from "http"

export const roles= [
  "admin",
  "osom",
  "cliente",
  "user",
]

const formSchema = z.object({  
  nombre: z.string().optional(),
  email: z.string().email(),    
  rol: z.string({required_error: "Role is required."}),
  clienteId: z.string().optional(),
})

export type UserFormValues = z.infer<typeof formSchema>

// This can come from your database or API.
const defaultValues: Partial<UserFormValues> = {
  rol: "cliente" // Default role as requested in PRP
}

interface Props{
  id?: string
  create: (data: UserFormValues) => Promise<User | null>
  update: (userId: string, json: UserFormValues) => Promise<User | null>
  closeDialog: () => void
}

export function UserForm({ id, create, update, closeDialog }: Props) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<DataClient[]>([])
  const [clientName, setClientName] = useState("")
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Watch role changes to show/hide client selector
  const watchedRole = form.watch("rol")
  
  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!search) return clients
    return clients.filter(client => 
      client.nombre.toLowerCase().includes(search.toLowerCase())
    )
  }, [clients, search])

  // Clear clienteId when role changes to non-client/user
  useEffect(() => {
    if (watchedRole !== "cliente" && watchedRole !== "user") {
      form.setValue("clienteId", "")
    }
  }, [watchedRole, form])

  async function onSubmit(data: UserFormValues) {

    setLoading(true)
    let message= null
    if (id) {
      await update(id, data)
      message= "Usuario editado 🏁"
    } else {
      await create(data)
      message= "Usuario creado 🏁"
    }
    setLoading(false)
      
    toast({title: message })

    closeDialog && closeDialog()
  }

  useEffect(() => {
    getDataClients().then((data) => {
      setClients(data)
    })

    if (id) {
      getDataUser(id).then((data) => {
        if (!data) return
        data.nombre && form.setValue("nombre", data.nombre)
        form.setValue("email", data.email)
        form.setValue("rol", data.rol)
        data.cliente && setClientName(data.cliente)
      })
    }  
  }, [form, id])



  return (
    <div className="p-4 rounded-md">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del usuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email del usuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    {
                      id ? 
                      <SelectValue className="text-muted-foreground">{form.getValues("rol")}</SelectValue> :
                      <SelectValue className="text-muted-foreground" placeholder="Selecciona un Rol" />
                    }
                    
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
              <FormDescription>admin: puede hacer todo</FormDescription>
              <FormDescription>osom: puede ver/editar todos los clientes</FormDescription>
              <FormDescription>client: puede ver/editar solo la info de un cliente</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {(watchedRole === "cliente" || watchedRole === "user") && (
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {field.value
                          ? clients.find(c => c.id === field.value)?.nombre || (id ? clientName : undefined)
                          : "Buscar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" side="top" sideOffset={5}>
                    <Command>
                      <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          placeholder="Buscar cliente..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <CommandGroup>
                        {filteredClients.slice(0, 10).map((client) => (
                          <CommandItem
                            key={client.id}
                            onSelect={() => {
                              field.onChange(client.id)
                              setOpen(false)
                              setSearch("")
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {client.nombre}
                          </CommandItem>
                        ))}
                        {filteredClients.length > 10 && (
                          <p className="text-sm text-muted-foreground px-2 py-1.5">
                            {filteredClients.length - 10} más resultados...
                          </p>
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>El cliente solo afecta a usuarios con rol &ldquo;cliente&rdquo;</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      <div className="flex justify-end">
        <Button onClick={() => closeDialog()} type="button" variant="secondary" className="w-32">Cancelar</Button>
        <Button type="submit"  variant="outline" className="w-32 ml-2" >{loading ? <LoadingSpinnerChico /> : <p>Guardar</p>}</Button>
      </div>
      </form>
    </Form>
   </div>
 )
}