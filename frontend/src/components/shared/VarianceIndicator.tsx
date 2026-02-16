import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface VarianceIndicatorProps {
  value: number;
  showIcon?: boolean;
  showSign?: boolean;
  className?: string;
}

export function VarianceIndicator({
  value,
  showIcon = true,
  showSign = true,
  className,
}: VarianceIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const getColor = () => {
    if (isPositive) return "text-success-600";
    if (isNegative) return "text-danger-600";
    return "text-neutral-500";
  };

  const getIcon = () => {
    if (!showIcon) return null;
    if (isPositive)
      return <TrendingUp className="h-4 w-4" aria-hidden="true" />;
    if (isNegative)
      return <TrendingDown className="h-4 w-4" aria-hidden="true" />;
    return <Minus className="h-4 w-4" aria-hidden="true" />;
  };

  const formatValue = () => {
    const formatted = Math.abs(value).toFixed(1);
    if (showSign && !isNeutral) {
      return `${isPositive ? "+" : "-"}${formatted}%`;
    }
    return `${formatted}%`;
  };

  const getAriaLabel = () => {
    const absValue = Math.abs(value).toFixed(1);
    if (isPositive)
      return `Positive variance: ${absValue} percent above target`;
    if (isNegative)
      return `Negative variance: ${absValue} percent below target`;
    return `No variance: exactly on target`;
  };

  return (
    <div
      className={cn("flex items-center gap-1", getColor(), className)}
      role="status"
      aria-label={getAriaLabel()}
    >
      {getIcon()}
      <span className="text-sm font-medium" aria-hidden="true">
        {formatValue()}
      </span>
    </div>
  );
}
