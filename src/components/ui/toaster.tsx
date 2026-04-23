import * as React from "react"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"
import { useToast } from "../../hooks/use-toast"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }, index) {
        const Icon = variant === "destructive" 
          ? AlertCircle 
          : variant === "success" 
            ? CheckCircle2 
            : Info;

        return (
          <Toast 
            key={id} 
            variant={variant} 
            {...props}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              zIndex: 100 - index,
              // CSS Variables for stacking
              "--index": index,
              "--offset": `${index * 8}px`,
              "--hover-offset": `${index * 85}px`,
              "--scale": 1 - index * 0.05,
              "--opacity": 1 - index * 0.15,
            } as React.CSSProperties}
            className={cn(
              "transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]",
              "transform-gpu translate-y-[var(--offset)] scale-[var(--scale)] opacity-[var(--opacity)]",
              "group-hover/viewport:translate-y-[var(--hover-offset)] group-hover/viewport:scale-100 group-hover/viewport:opacity-100",
              index > 2 && "opacity-0 pointer-events-none group-hover/viewport:opacity-100 group-hover/viewport:pointer-events-auto"
            )}
          >
            <div className="flex gap-4 items-start w-full">
              <div className={cn(
                "mt-0.5 rounded-full p-0.5",
                variant === 'success' ? "text-[#36b37e]" : "text-current"
              )}>
                <Icon className="h-5 w-5 flex-shrink-0" />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

