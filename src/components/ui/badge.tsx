import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  // Base styles - legende og rounded
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary - Soft Purple
        default:
          "border-transparent bg-primary/15 text-primary hover:bg-primary/25 hover:scale-105",
        // Secondary - Soft Teal
        secondary:
          "border-transparent bg-secondary/15 text-secondary hover:bg-secondary/25 hover:scale-105",
        // Accent - Warm Coral
        accent:
          "border-transparent bg-accent/15 text-accent hover:bg-accent/25 hover:scale-105",
        // Success - Mint Green
        success:
          "border-transparent bg-success/15 text-success hover:bg-success/25 hover:scale-105",
        // Warning - Sunny Yellow
        warning:
          "border-transparent bg-warning/20 text-warning-foreground hover:bg-warning/30 hover:scale-105",
        // Destructive
        destructive:
          "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25 hover:scale-105",
        // Outline - border only
        outline:
          "border-2 border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-105",
        // Solid variants for more emphasis
        "solid-primary":
          "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:scale-105",
        "solid-secondary":
          "border-transparent bg-secondary text-secondary-foreground shadow-md shadow-secondary/25 hover:shadow-lg hover:scale-105",
        "solid-accent":
          "border-transparent bg-accent text-white shadow-md shadow-accent/25 hover:shadow-lg hover:scale-105",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
