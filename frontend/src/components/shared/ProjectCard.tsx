import * as React from "react";
import { Project } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const handleClick = () => onClick?.(project);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(project);
    }
  };

  // Convert database status to StatusBadge format
  const statusMap: Record<
    string,
    "active" | "completed" | "on-hold" | "cancelled"
  > = {
    ACTIVE: "active",
    COMPLETED: "completed",
    ON_HOLD: "on-hold",
    CANCELLED: "cancelled",
  };
  const badgeStatus = statusMap[project.status] || "active";

  return (
    <div
      className={cn(
        "rounded-lg border border-secondary-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        onClick &&
          "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Project: ${project.name}, Job number ${project.jobNumber}, Status: ${project.status}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-secondary-900">
            {project.name}
          </h3>
          <p
            className="mt-1 text-sm text-secondary-600"
            aria-label={`Job number: ${project.jobNumber}`}
          >
            {project.jobNumber}
          </p>
        </div>
        <StatusBadge status={badgeStatus} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-secondary-500">Contract Amount</p>
          <p
            className="mt-1 text-base font-semibold text-secondary-900"
            aria-label={`Contract amount: ${formatCurrency(project.contractAmount)}`}
          >
            {formatCurrency(project.contractAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary-500">Budgeted GP</p>
          <p
            className="mt-1 text-base font-semibold text-secondary-900"
            aria-label={`Budgeted gross profit: ${formatPercentage(project.budgetedGpPct)}`}
          >
            {formatPercentage(project.budgetedGpPct)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-secondary-500">
        <time
          dateTime={project.startDate}
          aria-label={`Start date: ${new Date(project.startDate).toLocaleDateString()}`}
        >
          {new Date(project.startDate).toLocaleDateString()}
        </time>
        <span aria-hidden="true">→</span>
        <time
          dateTime={project.endDate}
          aria-label={`End date: ${new Date(project.endDate).toLocaleDateString()}`}
        >
          {new Date(project.endDate).toLocaleDateString()}
        </time>
      </div>
    </div>
  );
}
