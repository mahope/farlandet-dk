import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent"
  size?: "default" | "sm" | "lg" | "xl" | "icon"
  pulse?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, pulse = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          // Base styles - mere rounded og legende
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          // Variants
          {
            // Primary - Soft Purple med glow
            "bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-primary":
              variant === "default",

            // Accent - Warm Coral for CTA
            "bg-accent text-white rounded-2xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-accent":
              variant === "accent",

            // Destructive - rød med glow
            "bg-destructive text-destructive-foreground rounded-2xl shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:-translate-y-0.5 focus-visible:ring-destructive":
              variant === "destructive",

            // Outline - border med fill on hover
            "border-2 border-primary/30 bg-transparent text-primary rounded-2xl hover:bg-primary/10 hover:border-primary/50 hover:shadow-md focus-visible:ring-primary":
              variant === "outline",

            // Secondary - Soft Teal
            "bg-secondary text-secondary-foreground rounded-2xl shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/30 hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:ring-secondary":
              variant === "secondary",

            // Ghost - subtle hover
            "text-foreground rounded-xl hover:bg-primary/10 hover:text-primary focus-visible:ring-primary":
              variant === "ghost",

            // Link - underline animation
            "text-primary underline-offset-4 hover:underline decoration-2 decoration-primary/50 hover:decoration-primary rounded-lg p-0 h-auto":
              variant === "link",
          },
          // Sizes - mere rounded på større sizes
          {
            "h-11 px-5 py-2.5 text-sm": size === "default",
            "h-9 px-4 py-2 text-xs rounded-xl": size === "sm",
            "h-12 px-6 py-3 text-base rounded-2xl": size === "lg",
            "h-14 px-8 py-4 text-lg rounded-3xl font-bold": size === "xl",
            "h-11 w-11 rounded-xl p-0": size === "icon",
          },
          // Pulse animation for CTA buttons
          pulse && "animate-pulse-glow",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
