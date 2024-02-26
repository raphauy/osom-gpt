import { type ClassValue, clsx } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPresupuesto(presupuestoStr: string | undefined) {
  // in: 200000 USD, out: 200.000 USD
  // in: 200000, out: 200.000
  // in: 200000 UYU, out: 200.000 UYU

  if (!presupuestoStr) return ""

  const [presupuesto, moneda] = presupuestoStr.split(" ")
  // if presupuesto is not a number, return the original string
  if (isNaN(parseInt(presupuesto))) return presupuestoStr

  const presupuestoFormateado = parseInt(presupuesto).toLocaleString("es-UY")

  const monedaOut= moneda ? moneda : ""

  return `${presupuestoFormateado} ${monedaOut}`
}

export function removeSectionTexts(inputText: string): string {
  // Expresión regular que identifica el patrón, incluyendo saltos de línea
  // Uso de [\s\S]*? para coincidir con cualquier carácter incluyendo saltos de línea de forma no ávida
  const regex = /Text: ".*?",\n/gs;

  // Reemplazar las coincidencias encontradas por la cadena vacía
  const resultText = inputText.replace(regex, '');

  return resultText;
}
  

export function getFormat(date: Date): string {
  // if date is today return only the time
  const today= new Date()
  if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return format(date, "HH:mm")
  } else {
      return format(date, "yyyy/MM/dd")
  }
}
