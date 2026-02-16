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

  const getVariantLabel = () => {
    switch (variant) {
      case "success":
        return "Success progress";
      case "warning":
        return "Warning progress";
      case "danger":
        return "Danger progress";
      default:
        return "Progress";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-neutral-600">
          <span aria-label={`Current value: ${value.toLocaleString()}`}>
            {value.toLocaleString()}
          </span>
          <span aria-label={`Maximum value: ${max.toLocaleString()}`}>
            {max.toLocaleString()}
          </span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${getVariantLabel()}: ${percentage.toFixed(0)}% complete`}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            getVariantColor(),
          )}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">
        {percentage.toFixed(0)}% complete, {value.toLocaleString()} of{" "}
        {max.toLocaleString()}
      </span>
    </div>
  );
}
