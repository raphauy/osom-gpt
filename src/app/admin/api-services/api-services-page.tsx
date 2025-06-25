"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Plus, Save, Image, Mic, Hash, Loader, Edit } from "lucide-react"
import { getApiServicesAction, upsertApiServiceAction, deleteApiServiceAction, ApiService } from "./actions"
import { useSession } from "next-auth/react"

export function ApiServicesPage() {
    const [services, setServices] = useState<ApiService[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [editingService, setEditingService] = useState<ApiService | null>(null)
    const [saving, setSaving] = useState(false)

    const user= useSession()?.data?.user
    const isSuperAdmin= user?.email === "rapha.uy@rapha.uy"
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        serviceType: "",
        promptTokensCost: "",
        completionTokensCost: "",
        secondsCost: ""
    })

    useEffect(() => {
        loadServices()
    }, [])

    async function loadServices() {
        try {
            const data = await getApiServicesAction()
            setServices(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron cargar los servicios API",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        
        if (!formData.name || !formData.serviceType) {
            toast({
                title: "Error",
                description: "Nombre y tipo de servicio son requeridos",
                variant: "destructive"
            })
            return
        }

        setSaving(true)
        try {
            const promptTokensCost = formData.promptTokensCost ? parseFloat(formData.promptTokensCost) : 0
            const completionTokensCost = formData.completionTokensCost ? parseFloat(formData.completionTokensCost) : 0
            const secondsCost = formData.secondsCost ? parseFloat(formData.secondsCost) : 0

            await upsertApiServiceAction(
                formData.name,
                formData.serviceType,
                promptTokensCost,
                completionTokensCost,
                secondsCost
            )

            toast({
                title: "Éxito",
                description: editingService ? "Servicio API actualizado correctamente" : "Servicio API guardado correctamente"
            })

            setFormData({
                name: "",
                serviceType: "",
                promptTokensCost: "",
                completionTokensCost: "",
                secondsCost: ""
            })
            setIsAddingNew(false)
            setEditingService(null)
            loadServices()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo guardar el servicio API",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
            return
        }

        try {
            await deleteApiServiceAction(id)
            toast({
                title: "Éxito",
                description: "Servicio API eliminado correctamente"
            })
            loadServices()
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el servicio API",
                variant: "destructive"
            })
        }
    }

    function handleEdit(service: ApiService) {
        setEditingService(service)
        setFormData({
            name: service.name,
            serviceType: service.serviceType,
            promptTokensCost: service.promptTokensCost?.toString() || "",
            completionTokensCost: service.completionTokensCost?.toString() || "",
            secondsCost: service.secondsCost?.toString() || ""
        })
        setIsAddingNew(false) // Asegurar que no estemos en modo agregar
    }

    function handleCancelEdit() {
        setEditingService(null)
        setFormData({
            name: "",
            serviceType: "",
            promptTokensCost: "",
            completionTokensCost: "",
            secondsCost: ""
        })
    }

    function getServiceIcon(serviceType: string) {
        switch (serviceType) {
            case "image":
                return <Image className="w-4 h-4" aria-label="Servicio de imagen" />
            case "audio":
                return <Mic className="w-4 h-4" aria-label="Servicio de audio" />
            case "embedding":
                return <Hash className="w-4 h-4" aria-label="Servicio de embedding" />
            default:
                return null
        }
    }

    function getServiceTypeName(serviceType: string) {
        switch (serviceType) {
            case "image":
                return "Imagen"
            case "audio":
                return "Audio"
            case "embedding":
                return "Embedding"
            default:
                return serviceType
        }
    }

    if (loading) {
        return <div className="p-6">Cargando...</div>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Servicios API</h1>
                    <p className="text-muted-foreground">
                        Configura los costos de OpenAI para calcular márgenes de ganancia
                    </p>
                </div>
                {isSuperAdmin && (
                    <Button 
                        onClick={() => setIsAddingNew(true)}
                        disabled={isAddingNew || editingService !== null}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Servicio
                    </Button>
                )}
            </div>

            {isAddingNew && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Servicio API</CardTitle>
                        <CardDescription>
                            Agrega un nuevo servicio con sus costos de OpenAI
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nombre del Servicio</Label>
                                    <Input
                                        id="name"
                                        placeholder="ej: gpt-4-vision-preview"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="serviceType">Tipo de Servicio</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) => setFormData({...formData, serviceType: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Imagen</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="embedding">Embedding</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.serviceType === "image" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="promptTokensCost">Costo Prompt Tokens</Label>
                                        <Input
                                            id="promptTokensCost"
                                            type="number"
                                            step="0.001"
                                            placeholder="Por millón de tokens"
                                            value={formData.promptTokensCost}
                                            onChange={(e) => setFormData({...formData, promptTokensCost: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="completionTokensCost">Costo Completion Tokens</Label>
                                        <Input
                                            id="completionTokensCost"
                                            type="number"
                                            step="0.001"
                                            placeholder="Por millón de tokens"
                                            value={formData.completionTokensCost}
                                            onChange={(e) => setFormData({...formData, completionTokensCost: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.serviceType === "audio" && (
                                <div>
                                    <Label htmlFor="secondsCost">Costo por Segundo</Label>
                                    <Input
                                        id="secondsCost"
                                        type="number"
                                        step="0.0001"
                                        placeholder="Costo por segundo de audio"
                                        value={formData.secondsCost}
                                        onChange={(e) => setFormData({...formData, secondsCost: e.target.value})}
                                    />
                                </div>
                            )}

                            {formData.serviceType === "embedding" && (
                                <div>
                                    <Label htmlFor="promptTokensCost">Costo por Tokens</Label>
                                    <Input
                                        id="promptTokensCost"
                                        type="number"
                                        step="0.001"
                                        placeholder="Por millón de tokens"
                                        value={formData.promptTokensCost}
                                        onChange={(e) => setFormData({...formData, promptTokensCost: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Guardar
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    disabled={saving}
                                    onClick={() => {
                                        setIsAddingNew(false)
                                        setEditingService(null)
                                        setFormData({
                                            name: "",
                                            serviceType: "",
                                            promptTokensCost: "",
                                            completionTokensCost: "",
                                            secondsCost: ""
                                        })
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {editingService && (
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Servicio API</CardTitle>
                        <CardDescription>
                            Modifica los costos del servicio {editingService.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-name">Nombre del Servicio</Label>
                                    <Input
                                        id="edit-name"
                                        placeholder="ej: gpt-4-vision-preview"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-serviceType">Tipo de Servicio</Label>
                                    <Select
                                        value={formData.serviceType}
                                        onValueChange={(value) => setFormData({...formData, serviceType: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Imagen</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="embedding">Embedding</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.serviceType === "image" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit-promptTokensCost">Costo Prompt Tokens</Label>
                                        <Input
                                            id="edit-promptTokensCost"
                                            type="number"
                                            step="0.001"
                                            placeholder="Por millón de tokens"
                                            value={formData.promptTokensCost}
                                            onChange={(e) => setFormData({...formData, promptTokensCost: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-completionTokensCost">Costo Completion Tokens</Label>
                                        <Input
                                            id="edit-completionTokensCost"
                                            type="number"
                                            step="0.001"
                                            placeholder="Por millón de tokens"
                                            value={formData.completionTokensCost}
                                            onChange={(e) => setFormData({...formData, completionTokensCost: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.serviceType === "audio" && (
                                <div>
                                    <Label htmlFor="edit-secondsCost">Costo por Segundo</Label>
                                    <Input
                                        id="edit-secondsCost"
                                        type="number"
                                        step="0.0001"
                                        placeholder="Costo por segundo de audio"
                                        value={formData.secondsCost}
                                        onChange={(e) => setFormData({...formData, secondsCost: e.target.value})}
                                    />
                                </div>
                            )}

                            {formData.serviceType === "embedding" && (
                                <div>
                                    <Label htmlFor="edit-promptTokensCost-embedding">Costo por Tokens</Label>
                                    <Input
                                        id="edit-promptTokensCost-embedding"
                                        type="number"
                                        step="0.001"
                                        placeholder="Por millón de tokens"
                                        value={formData.promptTokensCost}
                                        onChange={(e) => setFormData({...formData, promptTokensCost: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Actualizar
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    disabled={saving}
                                    onClick={handleCancelEdit}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Servicios Configurados</CardTitle>
                    <CardDescription>
                        Lista de servicios API con sus costos configurados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {services.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No hay servicios configurados. Los costos aparecerán como $0 hasta que agregues servicios.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Prompt Tokens</TableHead>
                                    <TableHead>Completion Tokens</TableHead>
                                    <TableHead>Segundos</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell className="font-medium">
                                            {service.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getServiceIcon(service.serviceType)}
                                                {getServiceTypeName(service.serviceType)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {service.promptTokensCost ? 
                                                `$${service.promptTokensCost}/1M` : 
                                                "-"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {service.completionTokensCost ? 
                                                `$${service.completionTokensCost}/1M` : 
                                                "-"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {service.secondsCost ? 
                                                `$${service.secondsCost}/s` : 
                                                "-"
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(service)}
                                                    disabled={editingService?.id === service.id || isAddingNew}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(service.id)}
                                                    disabled={editingService?.id === service.id || isAddingNew}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 