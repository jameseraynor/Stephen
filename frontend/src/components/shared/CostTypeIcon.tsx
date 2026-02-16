import { cn } from "@/lib/utils";

type CostType = "L" | "M" | "E" | "S" | "F" | "O";

interface CostTypeIconProps {
  type: CostType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const costTypeConfig: Record<
  CostType,
  { label: string; color: string; bgColor: string }
> = {
  L: { label: "Labor", color: "text-blue-700", bgColor: "bg-blue-100" },
  M: { label: "Materials", color: "text-green-700", bgColor: "bg-green-100" },
  E: { label: "Equipment", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  S: {
    label: "Subcontract",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  F: { label: "PM", color: "text-pink-700", bgColor: "bg-pink-100" },
  O: { label: "Other", color: "text-gray-700", bgColor: "bg-gray-100" },
};

const sizeConfig = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function CostTypeIcon({
  type,
  size = "md",
  showLabel = false,
  className,
}: CostTypeIconProps) {
  const config = costTypeConfig[type];

  if (showLabel) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div
          className={cn(
            "flex items-center justify-center rounded font-semibold",
            sizeConfig[size],
            config.bgColor,
            config.color,
          )}
        >
          {type}
        </div>
        <span className="text-sm text-secondary-700">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded font-semibold",
        sizeConfig[size],
        config.bgColor,
        config.color,
        className,
      )}
      title={config.label}
    >
      {type}
    </div>
  );
}
