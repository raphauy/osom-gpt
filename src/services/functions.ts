import { JSONValue } from "ai";
import { getDocumentDAO } from "./document-services";
import { getSectionOfDocument } from "./section-services";

export const functions= [
  {
    name: "getSection",
    description:
      "Devuelve la información de una Section de un documento. La información debe utilizarse para responder a las preguntas del usuario. Los documentos están divididos en secciones y cada sección tiene un texto. Las secciones se numeran con secuencias comenzando desde 1.",
    parameters: {
      type: "object",
      properties: {
        docId: {
          type: "string",
          description: "Id del documento que se quiere consultar consultar.",
        },
        secuence: {
          type: "string",
          description: "Secuencia que identifica la sección del documento que se quiere consultar.",
        },
      },
      required: ["id", "secuence"],
    },    
  },
  {
    name: "getDocument",
    description:
      "Devuelve la información completa de un documento a partir de su id. Los documentos deben utilizarse para responder a las preguntas del usuario.",
    parameters: {
      type: "object",
      properties: {
        docId: {
          type: "string",
          description: "Id del documento que se quiere consultar consultar.",
        },
      },
      required: ["docId"],
    },    
  },
  {
    name: "notifyHuman",
    description:
      "Se debe invocar esta función para notificar a un agente inmobiliario cuando la intención del usuario es hablar con un humano o hablar con un agente inmobiliario o agendar una visita.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];




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
  console.log(`getSection: doc: ${section.document.name}, secuence: ${secuence}`)

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
  docURL: string | undefined;
  description: string | null;
  content: string | null;
};

export async function getDocument(id: string): Promise<DocumentResult | string> {
  const document= await getDocumentDAO(id)
  if (!document) return "Document not found"
  console.log(`getDocument: doc: ${document.name}`)

  return {
    docId: document.id,
    docName: document.name,
    docURL: document.url,
    description: document.description ?? null,
    content: document.textContent ?? null,
  }
}


export async function runFunction(name: string, args: any, clientId: string){
  switch (name) {
    case "getSection":
      return getSection(args.docId, args.secuence);
    case "getDocument":
      return getDocument(args.docId);
    case "notifyHuman":
      return notifyHuman(clientId);
    default:
      return null;
  }
}

