"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { LayoutGrid, List, PlusCircle, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { RepositoryDAO } from "@/services/repository-services"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import RepoGrid from "./repo-grid"
import { DataTable } from "./repository-table"
import { columns } from "./repository-columns"
import { RepositoryDialog } from "./repository-dialogs"

type Props= {
    repositories: RepositoryDAO[]
}
export default function RepositoriesTabs({ repositories }: Props) {

    const [filteredRepos, setfilteredRepos] = useState<RepositoryDAO[]>(repositories)
    const [showX, setShowX] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [clientInputValue, setClientInputValue] = useState("")
    const [showClientX, setShowClientX] = useState(false)
    function handleDeleteFilter() {
        setfilteredRepos(repositories)
        setShowX(false)
        setShowClientX(false)
        setInputValue("")
        setClientInputValue("")
    }
    function handleFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        if (value.length > 0) {
            setShowX(true)
            const filtered = repositories.filter(repository => repository.name.toLowerCase().includes(value.toLowerCase()))
            setfilteredRepos(filtered)
            setInputValue(value)
            setShowClientX(false)
            setClientInputValue("")
            } else {
            setShowX(false)
            setfilteredRepos(repositories)
            setInputValue("")
        }
    }
    function handleClientFilter(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        if (value.length > 0) {
            setShowClientX(true)
            const filtered = repositories.filter(repository => repository.function.clients.some(functionClient => functionClient.client.name.toLowerCase().includes(value.toLowerCase())))
            setfilteredRepos(filtered)
            setClientInputValue(value)
            setShowX(false)
            setInputValue("")
        } else {
            setShowClientX(false)
            setfilteredRepos(repositories)
            setClientInputValue("")
        }
    }
    return (
        <Tabs defaultValue="grid" className="mt-5 gap-4">
            <div className="flex justify-end gap-2 relative">
                <div className="relative w-full flex-grow">
                    <input type="text" placeholder="Buscar repositorio..." 
                        className="border pl-10 py-1 h-full rounded-md w-full" 
                        onChange={handleFilter}
                        value={inputValue}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <X 
                        className={cn("absolute right-3 top-2.5 text-gray-400 h-5 w-5 hover:cursor-pointer", showX ? "block" : "hidden")}
                        onClick={handleDeleteFilter} 
                    />
                </div>
                <div className="relative w-full flex-grow">
                    <input type="text" placeholder="Buscar por cliente..."
                        className="border pl-10 py-1 h-full rounded-md w-full" 
                        onChange={handleClientFilter}
                        value={clientInputValue}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <X 
                        className={cn("absolute right-3 top-2.5 text-gray-400 h-5 w-5 hover:cursor-pointer", showClientX  ? "block" : "hidden")}
                        onClick={handleDeleteFilter} 
                    />
                </div>
                <TabsList className="border h-10 bg-background">
                    <TabsTrigger value="grid" className="data-[state=active]:text-foreground"><LayoutGrid className="h-5 w-5" /></TabsTrigger>
                    <TabsTrigger value="list" className="data-[state=active]:text-foreground"><List className="h-5 w-5" /></TabsTrigger>
                </TabsList>

                <RepositoryDialog />
            </div>
            <TabsContent value="grid">
                <RepoGrid repositories={filteredRepos} />
            </TabsContent>

            <TabsContent value="list">
                <div className="container bg-white p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white dark:bg-black">
                    <DataTable columns={columns} data={filteredRepos} subject="Repositorio" />
                </div>
            </TabsContent>
        </Tabs>

    )
}
