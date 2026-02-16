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
  return (
    <div
      className={cn(
        "rounded-lg border border-secondary-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={() => onClick?.(project)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-secondary-900">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-secondary-600">{project.jobNumber}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-secondary-500">Contract Amount</p>
          <p className="mt-1 text-base font-semibold text-secondary-900">
            {formatCurrency(project.contractAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary-500">Budgeted GP</p>
          <p className="mt-1 text-base font-semibold text-secondary-900">
            {formatPercentage(project.budgetedGpPct)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-secondary-500">
        <span>{new Date(project.startDate).toLocaleDateString()}</span>
        <span>→</span>
        <span>{new Date(project.endDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
