import { getTimezone } from "@/services/clientService";
import { clsx, type ClassValue } from "clsx";
import { format as formatTZ, toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import he from 'he';
import { twMerge } from "tailwind-merge";
 
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
  // @ts-ignore
  const regex = /Text: ".*?",\n/gs;

  // Reemplazar las coincidencias encontradas por la cadena vacía
  const resultText = inputText.replace(regex, '');

  return resultText;
}
  

export function getFormat(date: Date, timezone?: string): string {
  
  const tz= timezone || "America/Montevideo"
  
  // Convert the date to the desired time zone
  const zonedDate = toZonedTime(date, tz);
  
  const today = toZonedTime(new Date(), tz);

  if (
    zonedDate.getDate() === today.getDate() &&
    zonedDate.getMonth() === today.getMonth() &&
    zonedDate.getFullYear() === today.getFullYear()
  ) {
    return formatTZ(zonedDate, "HH:mm", { timeZone: tz, locale: es });
  } else {
    return formatTZ(zonedDate, "yyyy/MM/dd", { timeZone: tz, locale: es });
  }
}

// export async function getFormat(date: Date, clientId?: string): Promise<string> {
//   const timeZone = clientId ? await getTimezone(clientId) || "America/Montevideo" : "America/Montevideo";
  
//   // Convert the date to the desired time zone
//   const zonedDate = toZonedTime(date, timeZone);
  
//   const today = toZonedTime(new Date(), timeZone);

//   if (
//     zonedDate.getDate() === today.getDate() &&
//     zonedDate.getMonth() === today.getMonth() &&
//     zonedDate.getFullYear() === today.getFullYear()
//   ) {
//     return formatTZ(zonedDate, "HH:mm", { timeZone, locale: es });
//   } else {
//     return formatTZ(zonedDate, "yyyy/MM/dd", { timeZone, locale: es });
//   }
// }

export function getFormatInTimezone(date: Date, timeZone: string) {
  
  // Convert the date to the desired time zone
  const zonedDate = toZonedTime(date, timeZone);
  
  const today = toZonedTime(new Date(), timeZone);

  if (
    zonedDate.getDate() === today.getDate() &&
    zonedDate.getMonth() === today.getMonth() &&
    zonedDate.getFullYear() === today.getFullYear()
  ) {
    return formatTZ(zonedDate, "HH:mm", { timeZone, locale: es });
  } else {
    return formatTZ(zonedDate, "yyyy/MM/dd", { timeZone, locale: es });
  }
}

export function getFormatWithTime(date: Date, timezone?: string): { primary: string; secondary: string } {
  const tz = timezone || "America/Montevideo"
  const zonedDate = toZonedTime(date, tz)
  const today = toZonedTime(new Date(), tz)
  
  if (
    zonedDate.getDate() === today.getDate() &&
    zonedDate.getMonth() === today.getMonth() &&
    zonedDate.getFullYear() === today.getFullYear()
  ) {
    return {
      primary: formatTZ(zonedDate, "HH:mm", { timeZone: tz, locale: es }),
      secondary: "Hoy"
    }
  } else {
    return {
      primary: formatTZ(zonedDate, "yyyy/MM/dd", { timeZone: tz, locale: es }),
      secondary: formatTZ(zonedDate, "HH:mm", { timeZone: tz, locale: es })
    }
  }
}

export function formatCurrency(value: number): string {
  return Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value)  
}

export function decodeAndCorrectText(str: string): string {
    // Verifica si el input es undefined o null y devuelve una cadena vacía
  if (str === undefined || str === null) {
    return ''
  }

  // Primero, decodifica las entidades HTML
  let decodedStr: string = he.decode(str)

  // Corrige la codificación incorrecta de tildes y eñes
  const replacements: { [key: string]: string } = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã±': 'ñ', 'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã“': 'Ó',
    'Ãš': 'Ú', 'Ã‘': 'Ñ',
    // los correctos
    'á': 'á', 'é': 'é', 'í': 'í', 'ó': 'ó', 'ú': 'ú', // Asegurar corrección si ya están correctos
    'Á': 'Á', 'É': 'É', 'Í': 'Í', 'Ó': 'Ó', 'Ú': 'Ú',
    'ñ': 'ñ', 'Ñ': 'Ñ'
  }

  Object.keys(replacements).forEach((key) => {
    const value: string = replacements[key];
    decodedStr = decodedStr.replace(new RegExp(key, 'g'), value);
  })

  // Manejar casos especiales como "cumplea{ tilde}os", "{ 'ia}"
  const specialReplacements: { [pattern: string]: string } = {
    '\\{ tilde\\}': 'ñ',
    '\\{ \'a\\}': 'á',
    '\\{ \'e\\}': 'é',
    '\\{ \'i\\}': 'í',
    '\\{ \'o\\}': 'ó',
    '\\{ \'u\\}': 'ú',
    '\\{ \'n\\}': 'ñ',
    // Versiones mayúsculas por si acaso también son necesarias
    '\\{ \'A\\}': 'Á',
    '\\{ \'E\\}': 'É',
    '\\{ \'I\\}': 'Í',
    '\\{ \'O\\}': 'Ó',
    '\\{ \'U\\}': 'Ú',
    '\\{ \'N\\}': 'Ñ',
  }

  Object.keys(specialReplacements).forEach((pattern) => {
    const replacement: string = specialReplacements[pattern];
    decodedStr = decodedStr.replace(new RegExp(pattern, 'g'), replacement);
  })

  const additionalReplacements: { [key: string]: string } = {
    'est�': 'está',
    'ma�ana': 'mañana',
    'a�o': 'año',
    'a�os': 'años',
    'cumplea�os': 'cumpleaños',    
    'Mart�n': 'Martín',
    'Malv�n': 'Malvín',
    'Juli�n': 'Julián',
    'Ger�nimo': 'Gerónimo',
    'Germ�n': 'Germán',
    'Gast�n': 'Gastón',
    'Est�vez': 'Estévez',
    'M�nimo': 'Mínimo',
    'M�ximo': 'Máximo',
    'M�nica': 'Mónica',
    'M�dico': 'Médico',
    'ni�os': 'niños',
    'Espa�a': 'España',
    'calefacci�o': 'calefacción',
  }
  
  Object.keys(additionalReplacements).forEach((key) => {
    const value: string = additionalReplacements[key];
    decodedStr = decodedStr.replace(new RegExp(key, 'g'), value);
  })

  // Luego, decodifica las secuencias de escape Unicode
  decodedStr = decodedStr.replace(/\\u([\dA-F]{4})/gi, (match, numStr) => {
    return String.fromCharCode(parseInt(numStr, 16));
  });

  return decodedStr;
}

export const colorPalette = [
  'rgb(53, 145, 118)',
  'rgb(48, 130, 106)',
  'rgb(58, 160, 130)',
  'rgb(43, 115, 94)',
  'rgb(63, 175, 142)',
  'rgb(38, 100, 82)',
  'rgb(68, 190, 154)',
  'rgb(33, 85, 70)',
  'rgb(73, 205, 166)',
  'rgb(23, 55, 46)',
];

export function formatNumberWithThousandsSeparator(number: number): string { 
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function getMonthName(month: string) {
  
  if (month.length === 7) month = (Number(month.slice(5, 7))).toString()
  if (month.length === 1) month = "0" + month

  switch (month) {
    case "01":
      return "enero"
    case "02":
      return "febrero"
    case "03":
      return "marzo"
    case "04":
      return "abril"
    case "05":
      return "mayo"
    case "06":
      return "junio"
    case "07":
      return "julio"
    case "08":
      return "agosto"
    case "09":
      return "septiembre"
    case "10":
      return "octubre"
    case "11":
      return "noviembre"
    case "12":
      return "diciembre"
    default:
      return "mes"
  }
}

export function getMonthNamePlusOne(month: string) {
  
  if (month.length === 7) month = (Number(month.slice(5, 7))+1).toString()
  if (month.length === 1) month = "0" + month

  switch (month) {
    case "01":
      return "enero"
    case "02":
      return "febrero"
    case "03":
      return "marzo"
    case "04":
      return "abril"
    case "05":
      return "mayo"
    case "06":
      return "junio"
    case "07":
      return "julio"
    case "08":
      return "agosto"
    case "09":
      return "septiembre"
    case "10":
      return "octubre"
    case "11":
      return "noviembre"
    case "12":
      return "diciembre"
    default:
      return "mes"
  }
}

// Función para sanitizar contenido Markdown quitando tablas
export function sanitizeMarkdown(content: string) {
  try {
    // Detectar patrones de tablas Markdown
    const tableRegex = /(\|[^\n]*\|\n)(\|[-\s|]*\|\n)(\|[^\n]*\|)*/g;
    return content.replace(tableRegex, "[Tabla no disponible en este formato]\n\n");
  } catch (e) {
    console.error("Error sanitizando markdown:", e);
    return content;
  }
}
