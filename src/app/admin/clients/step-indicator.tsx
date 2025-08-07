"use client"

import { Check, Search, Eye, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

type CloneStep = "select" | "preview" | "configure" | "progress"

interface StepIndicatorProps {
  currentStep: CloneStep
  completedSteps: CloneStep[]
}

const steps = [
  { id: "select" as CloneStep, label: "Seleccionar", icon: Search },
  { id: "preview" as CloneStep, label: "Vista Previa", icon: Eye },
  { id: "configure" as CloneStep, label: "Configurar", icon: Settings },
  { id: "progress" as CloneStep, label: "Progreso", icon: BarChart3 },
]

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = completedSteps.includes(step.id)
        const isCurrent = step.id === currentStep
        const isUpcoming = index > currentStepIndex

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Círculo del paso */}
            <div className="flex items-center flex-col">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                isCompleted && "bg-green-500 border-green-500 text-white",
                isCurrent && !isCompleted && "bg-primary border-primary text-primary-foreground",
                isUpcoming && "bg-muted border-muted-foreground/30 text-muted-foreground"
              )}>
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className={cn(
                "mt-2 text-xs font-medium text-center",
                isCurrent && "text-primary",
                isCompleted && "text-green-600 dark:text-green-400",
                isUpcoming && "text-muted-foreground"
              )}>
                {step.label}
              </div>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 mt-[-20px]">
                <div className={cn(
                  "w-full h-px transition-all duration-200",
                  isCompleted && "bg-green-500",
                  index < currentStepIndex && "bg-primary",
                  index >= currentStepIndex && "bg-muted-foreground/30"
                )} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}