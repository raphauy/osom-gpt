"use client"

import { useEffect } from "react"
import { format, isValid, parse, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"

export default function DateRangePicker() {
    const searchParams = useSearchParams()
    const startParam = searchParams?.get("start")
    const endParam = searchParams?.get("end")
    const [fecha, setFecha] = React.useState<DateRange | undefined>()
    const [abierto, setAbierto] = React.useState(false)

    const router = useRouter()

    useEffect(() => {
        if (startParam && endParam) {
            const start = parse(startParam, 'yyyy-MM-dd', new Date())
            const end = parse(endParam, 'yyyy-MM-dd', new Date())
            setFecha({ from: start, to: end })
        } else {
            setFecha({ from: subDays(new Date(), 30), to: new Date() })
        }
    }, [searchParams, startParam, endParam])

    const manejarSeleccionFecha = (nuevoRango: DateRange | undefined) => {
        setFecha(nuevoRango)
    }

    const aplicarSeleccion = () => {
        if (fecha?.from && fecha?.to) {
        console.log("Rango seleccionado:", {
            desde: format(fecha.from, "d 'de' MMMM, yyyy", { locale: es }),
            hasta: format(fecha.to, "d 'de' MMMM, yyyy", { locale: es })
        })
        setAbierto(false)
        router.push(`/admin/webhook-notifications?start=${format(fecha.from, "yyyy-MM-dd")}&end=${format(fecha.to, "yyyy-MM-dd")}`)
        } else {
        toast({
            title: "Error",
            description: "Debes seleccionar un rango de fechas",
            variant: "destructive"
        })
        }
    }

    function onOpen() {
        setAbierto(true)
        setFecha(undefined)
    }

    return (
        <div className={cn("grid gap-2")}>
        <Popover open={abierto} onOpenChange={setAbierto}>
            <PopoverTrigger asChild>
            <Button
                id="fecha"
                variant={"outline"}
                className={cn(
                "w-full max-w-[350px] justify-start text-left font-normal",
                !fecha && "text-muted-foreground"
                )}
                onClick={onOpen}
            >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                {fecha?.from ? (
                    fecha.to ? (
                    <>
                        {format(fecha.from, "d 'de' MMMM, yyyy", { locale: es })} -{" "}
                        {format(fecha.to, "d 'de' MMMM, yyyy", { locale: es })}
                    </>
                    ) : (
                    format(fecha.from, "d 'de' MMMM, yyyy", { locale: es })
                    )
                ) : (
                    "Selecciona un rango de fechas"
                )}
                </span>
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-4 p-3">
                <Calendar
                initialFocus
                mode="range"
                defaultMonth={fecha?.from}
                selected={fecha}
                onSelect={manejarSeleccionFecha}
                numberOfMonths={2}
                locale={es}
                classNames={{
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
                fromYear={1900}
                toYear={2025}
                />
                <div className="flex justify-end">
                <Button onClick={aplicarSeleccion}>Aplicar</Button>
                </div>
            </div>
            </PopoverContent>
        </Popover>
        </div>
    )
}