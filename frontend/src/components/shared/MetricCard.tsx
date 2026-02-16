import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-secondary-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-secondary-200 bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-secondary-900">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-secondary-500">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div
              className={cn(
                "mt-2 flex items-center text-sm",
                trendColors[trend],
              )}
            >
              {trend === "up" && <span className="mr-1">↑</span>}
              {trend === "down" && <span className="mr-1">↓</span>}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0 text-secondary-400">{icon}</div>
        )}
      </div>
    </div>
  );
}
