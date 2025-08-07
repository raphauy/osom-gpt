"use client"

import { Check, Search } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ClientSelectorModalProps {
  clients: Array<{ id: string; name: string; slug: string }>
  value: string
  onChange: (clientId: string, clientName: string) => void
}

export function ClientSelectorModal({ clients, value, onChange }: ClientSelectorModalProps) {
  const [searchValue, setSearchValue] = useState("")

  const filteredClients = useMemo(() => {
    if (!searchValue) return clients
    
    const lowerCaseSearchValue = searchValue.toLowerCase()
    return clients.filter((client) =>
      client.name.toLowerCase().includes(lowerCaseSearchValue) ||
      client.slug.toLowerCase().includes(lowerCaseSearchValue)
    )
  }, [clients, searchValue])

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-shrink-0 mb-4 pb-2">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nombre o slug..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
          autoComplete="off"
        />
      </div>

      <div className="flex-1 overflow-y-auto border rounded-md p-2 min-h-0">
        {filteredClients.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No se encontraron clientes
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  value === client.id && "ring-2 ring-primary"
                )}
                onClick={() => onChange(client.id, client.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.slug}</p>
                  </div>
                  {value === client.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}