import { DescriptionForm } from "@/components/description-form"
import { IconBadge } from "@/components/icon-badge"
import { TitleForm } from "@/components/title-form"
import { getFullRepositoryDAO } from "@/services/repository-services"
import { Database, Sparkles, Tag } from "lucide-react"
import { setFinalMessageAction, setFunctionDescriptionAction, setFunctionNameAction, setNameAction, setNotifyExecutionAction, setUILabelAction } from "../repository-actions"
import { DeleteRepositoryDialog } from "../repository-dialogs"
import SwitchBox from "./switch-box"
import CodeBlock from "@/components/code-block"
import { FieldDialog } from "../../fields/field-dialogs"
import { Separator } from "@/components/ui/separator"
import FieldsBox from "./fields-box"

type Props = {
  params: {
    repoId: string
  }
}

export default async function RepositoryPage({ params }: Props) {
  const repoId = params.repoId

  const repository= await getFullRepositoryDAO(repoId)

  return (
    <>
        <div className="p-6 bg-white dark:bg-black mt-4 border rounded-lg w-full">
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

                </div>
            </div> 
        </div>
        <div className="p-6 bg-white dark:bg-black mt-4 border rounded-lg w-full">
          <CodeBlock code={repository.function.definition!} />
        </div>
        <div className="flex justify-center w-full mt-10">
            <DeleteRepositoryDialog
                id={repository.id} 
                description={`Seguro que quieres eliminar el repositorio ${repository.name}`}
                withText={true}
            />
        </div>
    </>
  )
}
