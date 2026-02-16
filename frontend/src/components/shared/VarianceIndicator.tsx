import * as React from "react";
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
    if (isPositive) return <TrendingUp className="h-4 w-4" />;
    if (isNegative) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatValue = () => {
    const formatted = Math.abs(value).toFixed(1);
    if (showSign && !isNeutral) {
      return `${isPositive ? "+" : "-"}${formatted}%`;
    }
    return `${formatted}%`;
  };

  return (
    <div className={cn("flex items-center gap-1", getColor(), className)}>
      {getIcon()}
      <span className="text-sm font-medium">{formatValue()}</span>
    </div>
  );
}
