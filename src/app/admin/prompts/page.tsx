import { getDataClients } from "../clients/(crud)/actions"

export default async function PromptPage() {
    const clients= await getDataClients()

    return (
        <div className="container mt-10 space-y-5">
            <p className="mb-4 text-3xl font-bold text-center">Prompts</p>
            {
                clients.map(client => (
                    <div key={client.id} 
                        className="w-full p-4 border rounded-lg">
                        <p className="text-2xl font-bold">{client.nombre}</p>
                    </div>
                ))
            }
            
        </div>
    )
}
