import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Base styles - mere rounded og venlige
            "flex h-12 w-full rounded-xl border-2 bg-background px-4 py-3",
            "text-sm font-medium text-foreground",
            "placeholder:text-muted-foreground/60",
            "transition-all duration-300 ease-out",
            // Focus states
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            // Default border
            "border-border/50",
            // Hover state
            "hover:border-primary/30 hover:shadow-sm",
            // Focus state med glow
            "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-md focus-visible:shadow-primary/10",
            // Error state med shake
            error && "border-destructive focus-visible:ring-destructive/20 animate-shake",
            // Success state med glow
            success && "border-success focus-visible:ring-success/20 shadow-success/10",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            // File input
            "file:border-0 file:bg-primary/10 file:text-primary file:rounded-lg file:px-3 file:py-1 file:mr-3 file:font-medium file:text-sm",
            // Icon padding
            icon && "pl-11",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
