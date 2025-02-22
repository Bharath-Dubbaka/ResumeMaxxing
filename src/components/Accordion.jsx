"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

export const AccordionItem = ({
  value,
  trigger,
  children,
  className,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white/50 hover:bg-white/60 transition-colors"
      >
        <span className="text-xl font-semibold text-gray-800">{trigger}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-500 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isOpen ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="p-6 bg-white">{children}</div>
      </div>
    </div>
  );
};

export const Accordion = ({ children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
};