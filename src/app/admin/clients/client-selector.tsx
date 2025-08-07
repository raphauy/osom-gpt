"use client"

import { useState } from "react"
import { Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataClient } from "./(crud)/actions"

interface ClientSelectorProps {
  clients: DataClient[]
  selectedClient?: DataClient | null
  onClientSelect: (client: DataClient) => void
  searchPlaceholder?: string
}

export function ClientSelector({ 
  clients, 
  selectedClient, 
  onClientSelect, 
  searchPlaceholder = "Buscar cliente..." 
}: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = clients.filter(client =>
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className={`cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md ${
                selectedClient?.id === client.id 
                  ? "ring-2 ring-primary bg-primary/5" 
                  : ""
              }`}
              onClick={() => onClientSelect(client)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{client.nombre}</CardTitle>
                      {selectedClient?.id === client.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {client.descripcion && (
                      <CardDescription className="mt-1">
                        {client.descripcion}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {client.modelName}
                  </Badge>
                </div>
              </CardHeader>
              {client.url && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {client.url}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
          
          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No se encontraron clientes</p>
              <p className="text-sm">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {filteredClients.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      )}
    </div>
  )
}