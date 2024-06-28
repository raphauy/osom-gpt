import CodeBlock from "@/components/code-block"
import { DescriptionForm } from "@/components/description-form"
import { IconBadge } from "@/components/icon-badge"
import { TitleForm } from "@/components/title-form"
import { Separator } from "@/components/ui/separator"
import { getFullRepositoryDAO } from "@/services/repository-services"
import { Briefcase, Database, Sparkles, Tag } from "lucide-react"
import { setFinalMessageAction, setFunctionDescriptionAction, setFunctionNameAction, setNameAction, setNotifyExecutionAction } from "../repository-actions"
import { DeleteRepositoryDialog } from "../repository-dialogs"
import FieldsBox from "./fields-box"
import SwitchBox from "./switch-box"

type Props = {
  params: {
    repoId: string
  }
}

export default async function RepositoryPage({ params }: Props) {
  const repoId = params.repoId

  const repository= await getFullRepositoryDAO(repoId)

  if (!repository) return <div>Repositorio no encontrado</div>

  return (
    <>
        <div className="p-6 bg-white dark:bg-black mt-4 border rounded-lg w-full ml-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-w-96">
                    <div className="flex items-center space-x-2">
                      <IconBadge icon={Database} />
                      <h2 className="text-xl">
                          Información del repositorio
                      </h2>
                    </div>
                    <TitleForm
                      label="Nombre"
                      initialValue={repository.name}
                      id={repository.id}
                      update={setNameAction}
                    />

                    <Separator className="my-7" />

                    <div className="flex items-center space-x-2">
                      <IconBadge icon={Sparkles} />
                      <h2 className="text-xl">
                          Información de la función (function call) para el LLM
                      </h2>
                    </div>
                    <TitleForm
                        label="Nombre de la función"
                        initialValue={repository.functionName}
                        id={repository.id}
                        update={setFunctionNameAction}
                    />
                    <DescriptionForm
                        label="Descripción de la function"
                        initialValue={repository.functionDescription}
                        id={repository.id}
                        update={setFunctionDescriptionAction}
                    />
                    <DescriptionForm
                        label="Mensaje final para el usuario"
                        initialValue={repository.finalMessage || ""}
                        id={repository.id}
                        update={setFinalMessageAction}
                    />
                    <SwitchBox
                      repoId={repository.id}
                      checked={repository.notifyExecution} 
                      switchUpdate={setNotifyExecutionAction}
                      description="Notificar a Osom cuando se ejecute la función"
                      info= {`Se notificará a Osom vía API de whatsapp cuando se ejecute la función, en el mensaje de respuesta al usuario. Se adjunta al body 'function=${repository.functionName}'`}
                    />
                </div>
                <div className="min-w-96">
                    <div className="flex items-center gap-x-2">
                      <IconBadge icon={Tag} />
                      <h2 className="text-xl">
                          Campos del repositorio
                      </h2>
                    </div>

                    <div className="mt-6 border bg-slate-100 rounded-md p-2 dark:bg-black">
                      <FieldsBox initialFields={repository.fields} repoId={repository.id} />
                    </div>

                    <Separator className="my-7" />

                    <div className="flex items-center gap-x-2">
                      <IconBadge icon={Briefcase} />
                      <h2 className="text-xl">
                          Clientes de este repositorio
                      </h2>
                    </div>

                    <div className="mt-6 border bg-slate-100 rounded-md p-2 dark:bg-black">
                      {
                        repository.function.clients.map((client) => (
                          <div key={client.clientId} className="flex items-center justify-between gap-2 mb-1 mr-5">
                              <p className="whitespace-nowrap">{client.client.name}</p>
                          </div>
                        ))
                      }
                    </div>

                </div>
            </div> 
        </div>
        <div className="p-6 bg-white dark:bg-black mt-4 border rounded-lg w-full">
          <CodeBlock code={repository.function.definition!} showLineNumbers={true} />
        </div>
        <div className="flex justify-center w-full mt-10">
            <DeleteRepositoryDialog
                id={repository.id} 
                description={`Seguro que quieres eliminar el repositorio ${repository.name}?
                Hay ${repository.function.clients.length === 1 ? "1 cliente que utiliza" : `${repository.function.clients.length} clientes que utilizan`} la función de este repositorio (${repository.function.name}).`}
                withText={true}
            />
        </div>
    </>
  )
}