import { JSONValue } from "ai";
import { getDocumentDAO } from "./document-services";
import { getSectionOfDocument } from "./section-services";
import { NarvaezFormValues, createOrUpdateNarvaez } from "./narvaez-services";
import { getActiveConversation } from "./conversationService";
import { getValue } from "./config-services";
import { preprocessTextForJsonParse } from "@/lib/utils";
import { SummitFormValues, createSummit } from "./summit-services";
import { parse } from "path";
import { sendWapMessage } from "./osomService";


export async function notifyHuman(clientId: string){
  console.log("notifyHuman")
  return "dile al usuario que un agente se va a comunicar con él, saluda y finaliza la conversación. No ofrezcas más ayuda, saluda y listo."
}

export type SectionResult = {
  docId: string;
  docName: string;
  secuence: string;
  content: string | null;
};

export async function getSection(docId: string, secuence: string): Promise<SectionResult | string> {
  const section= await getSectionOfDocument(docId, parseInt(secuence))
  if (!section) return "Section not found"
  console.log(`\tgetSection: doc: ${section.document.name}, secuence: ${secuence}`)

  return {
    docId: section.documentId,
    docName: section.document.name,
    secuence: secuence,
    content: section.text ?? null,
  }
}

export type DocumentResult = {
  docId: string;
  docName: string;
  docURL: string | null;
  description: string | null;
  content: string | null;
};

export async function getDocument(id: string): Promise<DocumentResult | string> {
  const document= await getDocumentDAO(id)
  if (!document) return "Document not found"
  console.log(`\tgetDocument: doc: ${document.name}`)

  return {
    docId: document.id,
    docName: document.name,
    docURL: document.url ?? null,
    description: document.description ?? null,
    content: document.textContent ?? null,
  }
}

export async function getDateOfNow(){
  // return the current date and time in Montevideo time zone
  const res= new Date().toLocaleString("es-UY", {timeZone: "America/Montevideo"})
  console.log("getDateOfNow: " + res)
  return res
}

export async function registrarPedido(clientId: string, 
  conversationId: string, 
  clasificacion: string, 
  consulta: string, 
  nombre: string, 
  email: string | undefined, 
  horarioContacto: string | undefined, 
  idTrackeo: string | undefined, 
  urlPropiedad: string | undefined, 
  consultaAdicional: string | undefined, 
  resumenConversacion: string
  )
{

  console.log("registrarPedido")
  console.log(`\tclasificacion: ${clasificacion}`)
  console.log(`\tconsulta: ${consulta}`)
  console.log(`\tnombre: ${nombre}`)
  console.log(`\temail: ${email}`)
  console.log(`\thorarioContacto: ${horarioContacto}`)
  console.log(`\tidTrackeo: ${idTrackeo}`)
  console.log(`\turlPropiedad: ${urlPropiedad}`)
  console.log(`\tconsultaAdicional: ${consultaAdicional}`)
  console.log(`\tresumenConversacion: ${resumenConversacion}`)  

  const data: NarvaezFormValues = {
    conversationId,
    clasificacion,
    consulta,
    nombre,
    email,
    horarioContacto,
    idTrackeo,
    urlPropiedad,
    consultaAdicional,
    resumenPedido: resumenConversacion,
  }

  let created= null

  try {
    created= await createOrUpdateNarvaez(data)    
  } catch (error) {
    return "Error al registrar el pedido, pregunta al usuario si quiere que tu reintentes"
  }
  if (!created) return "Error al registrar el pedido, pregunta al usuario si quiere que tu reintentes"

  let NARVAEZ_Respuesta= await getValue("NARVAEZ_Respuesta")
  if (!NARVAEZ_Respuesta) {
    console.log("NARVAEZ_Respuesta not found")    
    NARVAEZ_Respuesta= "Pedido registrado, dile esto al usuario hablándole por su nombre lo siguiente: 'con la información que me pasaste un asesor te contactará a la brevedad'"
  }
  console.log("NARVAEZ_Respuesta: ", NARVAEZ_Respuesta)      

  return NARVAEZ_Respuesta
}

// nombreReserva: string | undefined
// nombreCumpleanero: string | undefined
// fechaReserva: Date | undefined
// email: string | undefined
// resumenConversacion: string | undefined

export async function reservarSummit(clientId: string, conversationId: string, nombreReserva: string | undefined, nombreCumpleanero: string | undefined, cantidadInvitados: number | undefined, fechaReserva: string | undefined, email: string | undefined, resumenConversacion: string | undefined){
  console.log("reservarSummit")
  console.log(`\tconversationId: ${conversationId}`)
  console.log(`\tnombreReserva: ${nombreReserva}`)
  console.log(`\tnombreCumpleanero: ${nombreCumpleanero}`)
  console.log(`\tcantidadInvitados: ${cantidadInvitados}`)
  console.log(`\tfechaReserva: ${fechaReserva}`)
  console.log(`\temail: ${email}`)
  console.log(`\tresumenConversacion: ${resumenConversacion}`)

  const data: SummitFormValues = {
    conversationId,
    nombreReserva,
    nombreCumpleanero,
    cantidadInvitados,
    fechaReserva,
    email,
    resumenConversacion,
  }

  let created= null

  try {
    created= await createSummit(data)    
  } catch (error) {
    return "Error al reservar, pregunta al usuario si quiere que tu reintentes"
  }

  if (!created) return "Error al reservar, pregunta al usuario si quiere que tu reintentes"

  let SUMMIT_Respuesta= await getValue("SUMMIT_Respuesta")
  if (!SUMMIT_Respuesta) {
    console.log("SUMMIT_Respuesta not found")    
    SUMMIT_Respuesta= "Reserva realizada, dile esto al usuario lo siguiente: 'con la información que me pasaste un asesor te contactará a la brevedad'"
  }
  console.log("SUMMIT_Respuesta: ", SUMMIT_Respuesta)      

  let SUMMIT_Celulares= await getValue("SUMMIT_Celulares")
  if (!SUMMIT_Celulares) {
    console.log("SUMMIT_Celulares not found")    
  } else {
    console.log("SUMMIT_Celulares: ", SUMMIT_Celulares)      
    const celulares= SUMMIT_Celulares.split(",")
    for (const phone of celulares) {
      console.log("enviar mensaje a: ", phone)
      if (resumenConversacion) {
        const textoMensaje= getTextoMensaje(data)
        console.log("textoMensaje:")
        console.log(textoMensaje)
        
        await sendWapMessage(phone, textoMensaje, false, clientId)
      } else console.log("resumenConversacion not found")
    }
  }

  return SUMMIT_Respuesta
}

export async function echoRegister(clientId: string, conversationId: string, texto: string | undefined){
  console.log("echoRegister")
  console.log(`\tconversationId: ${conversationId}`)
  console.log(`\ttexto: ${texto}`)

  if (texto) {
    const data: SummitFormValues = {
      conversationId,
      resumenConversacion: texto,
    }
    let created= null

    try {
      created= await createSummit(data)    
      return "Echo registrado"
    } catch (error) {
      return "Error al reservar, pregunta al usuario si quiere que tu reintentes"
    }
  
  } else console.log("texto not found")

  return "Mensaje enviado"

}

export async function runFunction(name: string, args: any, clientId: string){
  console.log("raw args.texto: ", args.texto)
  
  switch (name) {
    case "getSection":
      return getSection(args.docId, args.secuence)
    case "getDocument":
      return getDocument(args.docId)
    case "notifyHuman":
      return notifyHuman(clientId)
    case "getDateOfNow":
      return getDateOfNow()
    case "registrarPedido":
      return registrarPedido(clientId, 
        args.conversationId, 
        args.clasificacion, 
        preprocessTextForJsonParse(args.consulta),
        preprocessTextForJsonParse(args.nombre),
        args.email, 
        preprocessTextForJsonParse(args.horarioContacto),
        args.idTrackeo, 
        args.urlPropiedad, 
        preprocessTextForJsonParse(args.consultaAdicional),
        preprocessTextForJsonParse(args.resumenConversacion),
      )
    case "reservarSummit":
      return reservarSummit(clientId, 
        args.conversationId, 
        decodeUnicode(args.nombreReserva),
        decodeUnicode(args.nombreCumpleanero),
        parseInt(args.cantidadInvitados),
        decodeUnicode(args.fechaReserva),
        args.email,
        decodeUnicode(args.resumenConversacion),
      )
    case "echoRegister":
      return echoRegister(clientId, 
        args.conversationId, 
        decodeUnicode(args.texto)
      )
    default:
      return null
  }
}


function getTextoMensaje(data: SummitFormValues): string {
  const textoMensaje= `Nombre: ${data.nombreReserva}
Cumpleañero: ${data.nombreCumpleanero}
Cantidad de invitados: ${data.cantidadInvitados}
Fecha de la reserva: ${data.fechaReserva}
Email: ${data.email}
Resumen: ${data.resumenConversacion}
`
  return textoMensaje
}

function decodeUnicode(str: string): string {
  // Reemplaza las secuencias de escape Unicode por el carácter que representan
  return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
    return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
  });
}