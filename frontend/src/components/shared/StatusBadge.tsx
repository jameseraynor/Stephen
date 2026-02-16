import { cn } from "@/lib/utils";

type Status = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "bg-success-light text-success-dark border-success",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-secondary-100 text-secondary-700 border-secondary-300",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-warning-light text-warning-dark border-warning",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-error-light text-error-dark border-error",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
