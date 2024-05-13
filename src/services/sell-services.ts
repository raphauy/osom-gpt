import * as z from "zod"
import { prisma } from "@/lib/db"
import { ComClientDAO } from "./comclient-services"
import { ProductDAO } from "./product-services"
import { VendorDAO } from "./vendor-services"

export type SellDAO = {
	id: string
	externalId: string
	quantity: number
	currency: string
	comClient: ComClientDAO
	comClientId: string
	product: ProductDAO
	productId: string
	vendor: VendorDAO
	vendorId: string
}

export const sellSchema = z.object({
	externalId: z.string().min(1, "externalId is required."),
	quantity: z.number({required_error: "quantity is required."}),
	currency: z.string().min(1, "currency is required."),
	comClientId: z.string().min(1, "comClientId is required."),
	productId: z.string().min(1, "productId is required."),
	vendorId: z.string().min(1, "vendorId is required."),
})

export type SellFormValues = z.infer<typeof sellSchema>


export async function getSellsDAO() {
  const found = await prisma.sell.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as SellDAO[]
}

export async function getSellDAO(id: string) {
  const found = await prisma.sell.findUnique({
    where: {
      id
    },
  })
  return found as SellDAO
}
    
export async function createSell(data: SellFormValues) {
  // TODO: implement createSell
  const created = await prisma.sell.create({
    data
  })
  return created
}

export async function updateSell(id: string, data: SellFormValues) {
  const updated = await prisma.sell.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteSell(id: string) {
  const deleted = await prisma.sell.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullSellsDAO() {
  const found = await prisma.sell.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
			comClient: true,
			product: true,
			vendor: true,
		}
  })
  return found as SellDAO[]
}
  
export async function getFullSellDAO(id: string) {
  const found = await prisma.sell.findUnique({
    where: {
      id
    },
    include: {
			comClient: true,
			product: true,
			vendor: true,
		}
  })
  return found as SellDAO
}
    