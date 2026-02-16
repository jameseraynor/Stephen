import * as React from "react";
import { cn } from "@/lib/utils";
import { Users, Wrench, Package, DollarSign, Boxes } from "lucide-react";

export type CostType = "L" | "M" | "E" | "S" | "O";

export interface CostTypeIconProps {
  type: CostType;
  className?: string;
  showLabel?: boolean;
}

const costTypeConfig: Record<
  CostType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  L: {
    label: "Labor",
    icon: <Users className="h-4 w-4" />,
    color: "text-primary-600",
  },
  M: {
    label: "Material",
    icon: <Package className="h-4 w-4" />,
    color: "text-warning-600",
  },
  E: {
    label: "Equipment",
    icon: <Wrench className="h-4 w-4" />,
    color: "text-success-600",
  },
  S: {
    label: "Subcontractor",
    icon: <DollarSign className="h-4 w-4" />,
    color: "text-neutral-600",
  },
  O: {
    label: "Other",
    icon: <Boxes className="h-4 w-4" />,
    color: "text-neutral-500",
  },
};

export function CostTypeIcon({
  type,
  className,
  showLabel = false,
}: CostTypeIconProps) {
  const config = costTypeConfig[type];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(config.color)}>{config.icon}</div>
      {showLabel && <span className="text-sm font-medium">{config.label}</span>}
    </div>
  );
}
