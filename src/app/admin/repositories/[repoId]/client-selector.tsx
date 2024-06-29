"use client"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader, Search } from "lucide-react"
import * as React from "react"
import { addFunctionToClientAction } from "../repository-actions"
import { toast } from "@/components/ui/use-toast"


export type SelectorData={
    id: string,
    name: string
}

interface Props{
    selectors: SelectorData[]
    functionId: string,
    repoId: string
}
export function ClientSelector({ selectors, functionId, repoId }: Props) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [searchValue, setSearchValue] = React.useState("")
    const [loading, setLoading] = React.useState(false)

    const filteredValues = React.useMemo(() => {
      if (!searchValue) return selectors
      const lowerCaseSearchValue = searchValue.toLowerCase();
      return selectors.filter((client) => 
      client.name.toLowerCase().includes(lowerCaseSearchValue)
      )
    }, [selectors, searchValue])
  
    const customFilter = (searchValue: string, itemValue: string) => {      
      return itemValue.toLowerCase().includes(searchValue.toLowerCase()) ? searchValue.toLowerCase().length : 0
    }      
      
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
    }

    function handleSelected(clientId: string) {
      console.log("handleSelected, clientId: ", clientId)
      addFunctionToClientAction(clientId, functionId, repoId)
      .then(() => {
        toast({title: "Cliente agregado"})
      })
      .catch((error) => {
        console.log(error)
        toast({ title: "Error al agregar cliente", description: error.message, variant: "destructive" })
      })
      .finally(() => {
        setLoading(false)
        setValue("")
        setSearchValue("")      
      })
      
    }
  
    return (
      <div className="min-w-[300px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full text-lg whitespace-nowrap"
            >
              {value
                ? selectors.find(selector => selector.name.toLowerCase() === value.toLowerCase())?.name
                : "Agregar cliente al repositorio..."}
              {
                loading ? 
                  <Loader className="animate-spin" /> : 
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[270px] p-0" side="bottom">
            <Command filter={customFilter} className="max-h-96">
              <div className='flex items-center w-full gap-1 p-2 border border-gray-300 rounded-md shadow'>
                  <Search className="w-4 h-4 mx-1 opacity-50 shrink-0" />
                  <input placeholder="Buscar cliente..." onInput={handleInputChange} value={searchValue} className="w-full bg-transparent focus:outline-none"/>
              </div>
              
              <CommandEmpty>Cliente no encontrado</CommandEmpty>
              <CommandGroup onClick={() => setLoading(true)}>
                {filteredValues.map((line) => (
                  <CommandItem
                    key={line.id}
                    onSelect={(currentValue) => {
                      if (currentValue === value) {
                        setValue("")
                      } else {
                        setValue(currentValue)
                        handleSelected(line.id)
                      }
                      setSearchValue("")
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.toLowerCase() === line.name.toLowerCase() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {line.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

    )
  }
  

