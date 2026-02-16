import { cn } from "@/lib/utils";

export type StatusType = "active" | "completed" | "on-hold" | "cancelled";

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success-100 text-success-700 border-success-200",
  },
  completed: {
    label: "Completed",
    className: "bg-primary-100 text-primary-700 border-primary-200",
  },
  "on-hold": {
    label: "On Hold",
    className: "bg-warning-100 text-warning-700 border-warning-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        config.className,
        className,
      )}
      role="status"
      aria-label={`Project status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
