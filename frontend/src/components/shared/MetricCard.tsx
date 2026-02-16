import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        return (
          <TrendingUp className="h-4 w-4 text-success-600" aria-hidden="true" />
        );
      case "down":
        return (
          <TrendingDown
            className="h-4 w-4 text-danger-600"
            aria-hidden="true"
          />
        );
      case "neutral":
        return (
          <Minus className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        );
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

  const getTrendLabel = () => {
    switch (trend) {
      case "up":
        return "Trending up";
      case "down":
        return "Trending down";
      case "neutral":
        return "No change";
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn("", className)}
      role="article"
      aria-label={`Metric: ${title}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="text-neutral-500" aria-hidden="true">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" aria-label={`Value: ${value}`}>
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn("flex items-center gap-1", getTrendColor())}>
                {getTrendIcon()}
                {trendValue && (
                  <span
                    className="text-xs font-medium"
                    aria-label={`${getTrendLabel()}: ${trendValue}`}
                  >
                    {trendValue}
                  </span>
                )}
                <span className="sr-only">{getTrendLabel()}</span>
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
