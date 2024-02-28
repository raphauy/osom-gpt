import { JSONValue } from "ai";
import { getDocumentDAO } from "./document-services";
import { getSectionOfDocument } from "./section-services";
import { NarvaezFormValues, createOrUpdateNarvaez } from "./narvaez-services";
import { getActiveConversation } from "./conversationService";
import { getValue } from "./config-services";
import { preprocessTextForJsonParse } from "@/lib/utils";


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
  if (!created) return "Error al registrar el pedido"

  let NARVAEZ_Respuesta= await getValue("NARVAEZ_Comercial")
  if (!NARVAEZ_Respuesta) {
    console.log("NARVAEZ_Respuesta not found")    
    NARVAEZ_Respuesta= "Pedido registrado, dile esto al usuario hablándole por su nombre lo siguiente: 'con la información que me pasaste un asesor te contactará a la brevedad'"
  }
  console.log("NARVAEZ_Respuesta: ", NARVAEZ_Respuesta)      

  return NARVAEZ_Respuesta

  // switch (clasificacion) {

  //   case "Comercial":
  //     const NARVAEZ_Comercial= await getValue("NARVAEZ_Comercial") || "Pedido registrado, dile esto al usuario: Que le vaya bien con el uso comercial de la propiedad"
  //     return NARVAEZ_Respuesta
  //   case "Residencial":
  //     const NARVAEZ_Residencial= await getValue("NARVAEZ_Residencial") || "Pedido registrado, dile esto al usuario: Que le vaya bien con el uso residencial de la propiedad"
  //     return NARVAEZ_Residencial
  //   case "Industrial":
  //     const NARVAEZ_Industrial= await getValue("NARVAEZ_Industrial") || "Pedido registrado, dile esto al usuario: Que le vaya bien con el uso industrial de la propiedad"
  //     return NARVAEZ_Industrial

  //   default:
  //     return "Pedido registrado"
  // }
}

export async function runFunction(name: string, args: any, clientId: string){
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
    default:
      return null
  }
}

