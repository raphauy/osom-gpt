import { getClientBySlug } from "@/services/clientService"
import { getConversationsShortOfClient } from "@/services/conversationService"
import { columns } from "./columns-short"
import { DataTable } from "./data-table"

export async function ConversationsTable({ slug }: { slug: string }) {
    const client = await getClientBySlug(slug)
    if (!client) return <div>Cliente no encontrado</div>

    const conversations = await getConversationsShortOfClient(client.id)
    if (!conversations || conversations.length === 0) {
        return <div className="p-3 py-4 mx-auto text-muted-foreground dark:text-white w-full text-center">
            No hay conversaciones
        </div>
    }

    return (
        <div className="p-3 py-4 mx-auto text-muted-foreground dark:text-white min-w-72">
            <DataTable columns={columns} data={conversations} />
        </div>
    )
} 

export function ConversationsTableSkeleton() {
    return <div className="p-3 py-4 mx-auto text-muted-foreground dark:text-white min-w-72">
        {/* Input skeleton */}
        <div className="mb-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        
        {/* Headers skeleton */}
        <div className="flex mb-2 border-b pb-2">
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Rows skeleton */}
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex py-3 border-b">
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
        ))}
    </div>
}