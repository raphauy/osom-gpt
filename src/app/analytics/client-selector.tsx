"use client"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Ban, Check, ChevronsUpDown, Loader, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ClientMinimal, getClientsMinimalAction } from "./actions"
import { useEffect, useMemo, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, useSearchParams } from "next/navigation"


export function ClientSelector() {
    const searchParams= useSearchParams()
    const router= useRouter()
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [loading, setLoading] = useState(false)

    const [selectors, setSelectors] = useState<ClientMinimal[]>([])

    useEffect(() => {       
      const clientId= searchParams.get("cId")
      if (!clientId) 
        setValue("")      
    }, [searchParams])

    useEffect(() => {
      setLoading(true)
      getClientsMinimalAction()
      .then(clients => {
          setSelectors(clients)
      })
      .catch(error => console.log(error))
      .finally(() => {
        setLoading(false)
      })
    }, [])

    const filteredValues = useMemo(() => {
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

    function handleSelected(clientId: string | null) {
      console.log("handleSelected, clientId: ", clientId)
     
      const allParams= searchParams.toString()
      // allParams is like: last=30D&indicatorId=conversations
      console.log("allParams: ", allParams)
      // remove the actual cId param
      let newParams = allParams.replace(/([&]?)(cId)=[^&]+/g, "")
      newParams= newParams.startsWith("&") ? newParams.slice(1) : newParams
      const restOfTheParams= newParams ? `&${newParams}` : ""
      
      if (clientId) {
        router.push(`/analytics?cId=${clientId}${restOfTheParams}`)
      } else {
        router.push(`/analytics?${restOfTheParams}`)
      }
    }

    const idicatorId= searchParams.get("indicatorId")
  
    return (
      <div className="min-w-[270px]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              disabled={!idicatorId}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("justify-between w-full text-lg whitespace-nowrap", !value && "border-none")}
            >
              {value
                ? selectors.find(selector => selector.name.toLowerCase() === value.toLowerCase())?.name
                : "Filtrar por cliente..."}
              {
                loading ? 
                  <Loader className="animate-spin" /> : 
                  <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-full min-w-[270px]" side="bottom">
            <Command filter={customFilter} className="max-h-96">
              <div className='flex items-center w-full gap-1 p-2 border border-gray-300 rounded-md shadow'>
                  <Search className="w-4 h-4 mx-1 opacity-50 shrink-0" />
                  <input placeholder="Buscar cliente..." onInput={handleInputChange} value={searchValue} className="w-full bg-transparent focus:outline-none"/>
              </div>
              
              <CommandEmpty>Cliente no encontrado</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72 overflow-auto">
                  <CommandItem
                    className={!value ? "hidden" : ""}
                    onSelect={() => {
                      setValue("")
                      setSearchValue("")
                      setOpen(false)
                      handleSelected(null)
                    }}
                  >
                    <Ban className={cn("mr-2 h-4 w-4")} />
                    Quitar filtro
                  </CommandItem>
                  {filteredValues.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={(currentValue) => {
                        if (currentValue === value) {
                          setValue("")
                        } else {
                          setValue(currentValue)
                          handleSelected(item.id)
                        }
                        setSearchValue("")
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.toLowerCase() === item.name.toLowerCase() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

    )
  }
  

