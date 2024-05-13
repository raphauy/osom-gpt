import * as z from "zod"
import { prisma } from "@/lib/db"
import { CategoryDAO, CategoryFormValues, createCategory, getCategoryDAO, getCategoryDAOByName } from "./category-services"
import { getClientBySlug } from "./clientService"

export type ProductDAO = {
	id: string
	externalId: string
	code: string
	name: string
	stock: number
	pedidoEnOrigen: number
	precioUSD: number
	category: CategoryDAO
	categoryId: string
  clientId: string
}

export const productSchema = z.object({
	externalId: z.string().min(1, "externalId is required."),
	code: z.string().min(1, "code is required."),
	name: z.string().min(1, "name is required."),
	stock: z.number({required_error: "stock is required."}),
	pedidoEnOrigen: z.number({required_error: "pedidoEnOrigen is required."}),
	precioUSD: z.number({required_error: "precioUSD is required."}),
	categoryName: z.string().min(1, "categoryId is required."),
  clientSlug: z.string().min(1, "clientSlug is required."),
})

export type ProductFormValues = z.infer<typeof productSchema>


export async function getProductsDAO() {
  const found = await prisma.product.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as ProductDAO[]
}

export async function getProductDAO(id: string) {
  const found = await prisma.product.findUnique({
    where: {
      id
    },
  })
  return found as ProductDAO
}
    
export async function createProduct(data: ProductFormValues) {
  const categoryName= data.categoryName
  const client= await getClientBySlug(data.clientSlug)
  if (!client) {
    throw new Error("client not found")
  }
  let category = await getCategoryDAOByName(categoryName)
  if (!category) {
    // create category
    const categoryForm: CategoryFormValues = {
      name: categoryName, 
      clientId: client.id
    }
    const createdCategory = await createCategory(categoryForm)
    category = createdCategory
  }
  const dataWithCategory = {
    externalId: data.externalId,
    code: data.code,
    name: data.name,
    stock: data.stock,
    pedidoEnOrigen: data.pedidoEnOrigen,
    precioUSD: data.precioUSD,
    categoryId: category.id,
    clientId: client.id
  }
  const created = await prisma.product.create({
    data: dataWithCategory
  })
  return created
}

export async function updateProduct(id: string, data: ProductFormValues) {
  const updated = await prisma.product.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteProduct(id: string) {
  const deleted = await prisma.product.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullProductsDAO(slug: string) {
  const client = await getClientBySlug(slug)
  if (!client) {
    throw new Error("client not found")
  }
  const found = await prisma.product.findMany({
    where: {
      clientId: client.id
    },
    orderBy: {
      name: 'asc'
    },
    include: {
			category: true,
		}
  })
  return found as ProductDAO[]
}
  
export async function getFullProductDAO(id: string) {
  const found = await prisma.product.findUnique({
    where: {
      id
    },
    include: {
			category: true,
		}
  })
  return found as ProductDAO
}
    