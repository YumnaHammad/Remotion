"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Template" },
  { id: 2, label: "Content" },
  { id: 3, label: "Edit" },
  { id: 4, label: "Preview" },
  { id: 5, label: "Export" },
] as const;

interface StepIndicatorProps {
  current: number;
  className?: string;
}

/** Visual progress for the 5-step simple workflow. */
export function StepIndicator({ current, className }: StepIndicatorProps) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs sm:gap-0",
        className
      )}
    >
      {STEPS.map((step, i) => (
        <li key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 font-medium transition",
              current >= step.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                current >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.id}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-1 hidden h-px w-6 sm:block",
                current > step.id ? "bg-primary/40" : "bg-border"
              )}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export { STEPS };
