import * as z from "zod"
import { prisma } from "@/lib/db"
import { Parameters, RepositoryDAO, generateFunctionDefinition, getFullRepositoryDAO, updateFunctionDefinition } from "./repository-services"
import { FieldType } from "@prisma/client"

export type FieldDAO = {
	id: string
	name: string
	type: FieldType
	description: string
	required: boolean
  items: string | null | undefined
  order: number
	repositoryId: string
	createdAt: Date
	updatedAt: Date
}

// const itemsSchema= {
//   "type": "object",
//   "properties": {
//     "type": {
//       "type": "string",
//       "enum": ["string", "number", "boolean", "object", "array"]
//     },
//     "properties": {
//       "type": "object",
//       "patternProperties": {
//         "^[a-zA-Z0-9_]+$": {
//           "$ref": "#/definitions/schema"
//         }
//       },
//       "additionalProperties": false
//     },
//     "items": {
//       "$ref": "#/definitions/schema"
//     }
//   },
//   "required": ["type"],
//   "definitions": {
//     "schema": {
//       "type": "object",
//       "properties": {
//         "type": {
//           "type": "string",
//           "enum": ["string", "number", "boolean", "object", "array"]
//         },
//         "properties": {
//           "type": "object",
//           "patternProperties": {
//             "^[a-zA-Z0-9_]+$": {
//               "$ref": "#/definitions/schema"
//             }
//           },
//           "additionalProperties": false
//         },
//         "items": {
//           "$ref": "#/definitions/schema"
//         }
//       },
//       "required": ["type"]
//     }
//   }
// }


// Definición recursiva para manejar esquemas anidados
const itemsSchema: z.ZodSchema = z.lazy(() =>
  z.object({
    type: z.enum(["string", "number", "boolean", "object", "array"]),
    properties: z
      .record(z.string(), itemsSchema)
      .optional()
      .refine((val) => (val ? Object.keys(val).length > 0 : true), {
        message: "Si 'properties' está presente, debe tener al menos una propiedad.",
      }),
    items: z.lazy(() => itemsSchema).optional(),
  })
);

export const fieldSchema = z.object({
	name: z.string().min(1, "nombre es obligatorio."),
	type: z.nativeEnum(FieldType),
	description: z.string().min(1, "descripción es obligatoria."),
	required: z.boolean().default(false),
	repositoryId: z.string().min(1, "repositoryId es obligatorio."),
  items: z
    .string()
    .optional()
    .refine((val) => {
      if (val && val.trim() !== "") {
        try {
          itemsSchema.parse(JSON.parse(val));
          return true;
        } catch (e) {
          return false;
        }
      }
      return true;
    }, { message: "La definición de 'items' debe ser un JSON válido que cumpla con el esquema de OpenAI para items de un array." }),
  });

export type FieldFormValues = z.infer<typeof fieldSchema>


export async function getFieldsDAO() {
  const found = await prisma.field.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as FieldDAO[]
}

export async function getFieldDAO(id: string) {
  const found = await prisma.field.findUnique({
    where: {
      id
    },
  })
  return found as FieldDAO
}
    
export async function createField(data: FieldFormValues) {
  const lastOrder= await prisma.field.count(
    {
      where: {
        repositoryId: data.repositoryId
      }
    }
  )
  const created = await prisma.field.create({
    data: {
      ...data,
      order: lastOrder + 1
    }
  })

  await updateFunctionDefinition(data.repositoryId)

  return created
}

export async function updateField(id: string, data: FieldFormValues) {
  const updated = await prisma.field.update({
    where: {
      id
    },
    data
  })

  await updateFunctionDefinition(data.repositoryId)

  return updated
}

export async function deleteField(id: string) {
  const deleted = await prisma.field.delete({
    where: {
      id
    },
  })

  await updateFunctionDefinition(deleted.repositoryId)

  return deleted
}


export async function getFullFieldsDAO() {
  const found = await prisma.field.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
			repository: true,
		}
  })
  return found as FieldDAO[]
}
  
export async function getFullFieldDAO(id: string) {
  const found = await prisma.field.findUnique({
    where: {
      id
    },
    include: {
			repository: true,
		}
  })
  return found as FieldDAO
}
    
export async function updateOrder(fields: FieldDAO[]): Promise<string> {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    await prisma.field.update({
      where: {
        id: field.id,
      },
      data: {
        order: i,
      },
    })
  }

  await updateFunctionDefinition(fields[0].repositoryId)

  return fields[0].repositoryId
}

export async function getFieldsDAOByRepositoryId(repositoryId: string) {
  const found = await prisma.field.findMany({
    where: {
      repositoryId
    },
    orderBy: {
      order: "asc"
    },
  })
  return found as FieldDAO[]
}