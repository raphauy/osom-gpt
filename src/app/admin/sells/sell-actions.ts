"use server"
  
import { revalidatePath } from "next/cache"
import { SellDAO, SellFormValues, createSell, updateSell, getFullSellDAO, deleteSell } from "@/services/sell-services"


export async function getSellDAOAction(id: string): Promise<SellDAO | null> {
    return getFullSellDAO(id)
}

export async function createOrUpdateSellAction(id: string | null, data: SellFormValues): Promise<SellDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateSell(id, data)
    } else {
        updated= await createSell(data)
    }     

    revalidatePath("/admin/sells")

    return updated as SellDAO
}

export async function deleteSellAction(id: string): Promise<SellDAO | null> {    
    const deleted= await deleteSell(id)

    revalidatePath("/admin/sells")

    return deleted as SellDAO
}

