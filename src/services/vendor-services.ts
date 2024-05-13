import * as z from "zod"
import { prisma } from "@/lib/db"

export type VendorDAO = {
	id: string
	name: string
}

export const vendorSchema = z.object({
	name: z.string().min(1, "name is required."),
})

export type VendorFormValues = z.infer<typeof vendorSchema>


export async function getVendorsDAO() {
  const found = await prisma.vendor.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as VendorDAO[]
}

export async function getVendorDAO(id: string) {
  const found = await prisma.vendor.findUnique({
    where: {
      id
    },
  })
  return found as VendorDAO
}
    
export async function createVendor(data: VendorFormValues) {
  // TODO: implement createVendor
  const created = await prisma.vendor.create({
    data
  })
  return created
}

export async function updateVendor(id: string, data: VendorFormValues) {
  const updated = await prisma.vendor.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteVendor(id: string) {
  const deleted = await prisma.vendor.delete({
    where: {
      id
    },
  })
  return deleted
}


export async function getFullVendorsDAO() {
  const found = await prisma.vendor.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
		}
  })
  return found as VendorDAO[]
}
  
export async function getFullVendorDAO(id: string) {
  const found = await prisma.vendor.findUnique({
    where: {
      id
    },
    include: {
		}
  })
  return found as VendorDAO
}
    