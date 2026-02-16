import { cn } from "@/lib/utils";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface VarianceIndicatorProps {
  value: number;
  format?: "currency" | "percentage" | "number";
  showSign?: boolean;
  className?: string;
}

export function VarianceIndicator({
  value,
  format = "currency",
  showSign = true,
  className,
}: VarianceIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const colorClass = cn({
    "text-success": isPositive,
    "text-error": isNegative,
    "text-secondary-500": isNeutral,
  });

  const bgClass = cn({
    "bg-success-light": isPositive,
    "bg-error-light": isNegative,
    "bg-secondary-100": isNeutral,
  });

  function formatValue(val: number): string {
    const absValue = Math.abs(val);

    switch (format) {
      case "currency":
        return formatCurrency(absValue);
      case "percentage":
        return formatPercentage(absValue);
      case "number":
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }).format(absValue);
      default:
        return String(absValue);
    }
  }

  const sign = showSign ? (isPositive ? "+" : isNegative ? "-" : "") : "";
  const arrow = isPositive ? "↑" : isNegative ? "↓" : "";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium",
        bgClass,
        colorClass,
        className,
      )}
    >
      {arrow && <span>{arrow}</span>}
      <span>
        {sign}
        {formatValue(value)}
      </span>
    </span>
  );
}
