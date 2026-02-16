import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  variant = "default",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantColor = () => {
    switch (variant) {
      case "success":
        return "bg-success-600";
      case "warning":
        return "bg-warning-600";
      case "danger":
        return "bg-danger-600";
      default:
        return "bg-primary-600";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-neutral-600">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            getVariantColor(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
