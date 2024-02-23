
import { getCurrentUser } from "@/lib/auth";
import MenuAdmin from "./menu-admin";
import MenuOsom from "./menu-osom";
import { ClientSelector, SelectorData } from "./client-selector";
import { getDataClients } from "@/app/admin/clients/(crud)/actions";
import getClients from "@/services/clientService";

export default async function Menu() {
    
    const user= await getCurrentUser()

    if (!user) return <div></div>

    const clients= await getClients()
    const selectorData: SelectorData[]= clients.map(client => ({slug: client.slug, name: client.name}))

    if (user.role === "admin") 
        return (
            <div className="flex">
                <div className="flex">
                    <ClientSelector selectors={selectorData} />
                    <MenuAdmin />
                    {/* <MenuOsom /> */}
                </div>
            </div>
        )

    return (
        <div></div>
    );
}
