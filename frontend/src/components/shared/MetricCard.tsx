import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  trendValue,
  className,
  icon,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-danger-600" />;
      case "neutral":
        return <Minus className="h-4 w-4 text-neutral-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success-600";
      case "down":
        return "text-danger-600";
      case "neutral":
        return "text-neutral-500";
      default:
        return "";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-neutral-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn("flex items-center gap-1", getTrendColor())}>
                {getTrendIcon()}
                {trendValue && (
                  <span className="text-xs font-medium">{trendValue}</span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-neutral-500">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
