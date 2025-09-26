"use client";
import * as React from "react";
import {
  Tooltip as RadixTooltip,
  TooltipProvider as RadixTooltipProvider,
  TooltipTrigger as RadixTooltipTrigger,
  TooltipContent as RadixTooltipContent,
  TooltipArrow as RadixTooltipArrow,
} from "@radix-ui/react-tooltip";

export const TooltipProvider = RadixTooltipProvider;
export const Tooltip = RadixTooltip;
// Sudah diekspor di atas, jangan duplikat
export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixTooltipContent>
>((props, ref) => (
  <RadixTooltipContent
    ref={ref}
    sideOffset={4}
    className="z-50 rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md animate-in fade-in"
    {...props}
  >
    {props.children}
    <RadixTooltipArrow className="fill-popover" />
  </RadixTooltipContent>
));
export const TooltipArrow = RadixTooltipArrow;
export const TooltipTrigger = RadixTooltipTrigger;
