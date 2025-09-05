import * as React from "react"

import { cn } from "@/lib/utils"

export function Accordion({ children, type = "single", collapsible = false, ...props }) {
  return (
    <div {...props} className={cn("accordion", props.className)}>
      {children}
    </div>
  )
}

export function AccordionItem({ children, value, ...props }) {
  return (
    <div {...props} className={cn("accordion-item", props.className)} data-value={value}>
      {children}
    </div>
  )
}

export function AccordionTrigger({ children, ...props }) {
  return (
    <button {...props} className={cn("accordion-trigger", props.className)}>
      {children}
    </button>
  )
}

export function AccordionContent({ children, ...props }) {
  return (
    <div {...props} className={cn("accordion-content", props.className)}>
      {children}
    </div>
  )
}
