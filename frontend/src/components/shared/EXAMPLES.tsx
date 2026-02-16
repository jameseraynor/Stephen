/**
 * EXAMPLES - Ejemplos de uso de componentes compartidos
 *
 * Este archivo muestra patrones comunes de uso.
 * NO importar en producción - solo referencia.
 */

import { useState } from "react";
import {
  CostCodeSelect,
  CostTypeIcon,
  CurrencyInput,
  DataTable,
  HoursInput,
  MetricCard,
  PercentageInput,
  ProjectCard,
  StatusBadge,
  VarianceIndicator,
  Column,
} from "./index";
import {
  formatCurrency,
  formatHours,
  formatPercentage,
} from "@/utils/formatters";
import { Project, BudgetLine, CostCode } from "@/types";

// ============================================================================
// EJEMPLO 1: Dashboard con MetricCards
// ============================================================================

export function DashboardExample() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <MetricCard
        title="Contract Amount"
        value="$15.19M"
        subtitle="Original contract"
      />

      <MetricCard
        title="Budgeted GP"
        value="31.5%"
        subtitle="Target gross profit"
      />

      <MetricCard
        title="Current GP"
        value="14.4%"
        subtitle="Forecast at completion"
        trend="down"
        trendValue="-17.1%"
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Lista de Proyectos con ProjectCard
// ============================================================================

export function ProjectListExample({ projects }: { projects: Project[] }) {
  function handleProjectClick(project: Project) {
    console.log("Navigate to:", project.id);
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={handleProjectClick}
        />
      ))}
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Formulario de Budget Entry
// ============================================================================

export function BudgetEntryFormExample({
  costCodes,
}: {
  costCodes: CostCode[];
}) {
  const [costCodeId, setCostCodeId] = useState("");
  const [hours, setHours] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!costCodeId) {
      newErrors.costCode = "Cost code is required";
    }
    if (!hours || hours <= 0) {
      newErrors.hours = "Hours must be greater than 0";
    }
    if (!amount || amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic here
    console.log({ costCodeId, hours, amount });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Cost Code <span className="text-error">*</span>
          </label>
          <CostCodeSelect
            costCodes={costCodes}
            value={costCodeId}
            onChange={setCostCodeId}
            error={errors.costCode}
            placeholder="Select cost code..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Hours <span className="text-error">*</span>
          </label>
          <HoursInput
            value={hours ?? undefined}
            onChange={setHours}
            error={errors.hours}
            placeholder="0.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Amount <span className="text-error">*</span>
          </label>
          <CurrencyInput
            value={amount ?? undefined}
            onChange={setAmount}
            error={errors.amount}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-md border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Add Budget Line
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// EJEMPLO 4: Tabla de Budget Lines con DataTable
// ============================================================================

export function BudgetTableExample({
  budgetLines,
}: {
  budgetLines: BudgetLine[];
}) {
  const [sortBy, setSortBy] = useState<string>("code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const columns: Column<BudgetLine>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.costCode && (
            <>
              <CostTypeIcon type={getCostType(item.costCode.type)} size="sm" />
              <span className="font-mono">{item.costCode.code}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (item) => item.costCode?.description || item.description,
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      render: (item) => item.costCode?.type,
    },
    {
      key: "hours",
      header: "Hours",
      align: "right",
      sortable: true,
      render: (item) => formatHours(item.budgetedQuantity),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      render: (item) => formatCurrency(item.budgetedAmount),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            className="text-primary-600 hover:text-primary-900"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            className="text-error hover:text-error-dark"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  function handleEdit(item: BudgetLine) {
    console.log("Edit:", item);
  }

  function handleDelete(item: BudgetLine) {
    console.log("Delete:", item);
  }

  function getCostType(type: string): "L" | "M" | "E" | "S" | "F" | "O" {
    const typeMap: Record<string, "L" | "M" | "E" | "S" | "F" | "O"> = {
      LABOR: "L",
      MATERIAL: "M",
      EQUIPMENT: "E",
      SUBCONTRACTOR: "S",
      OTHER: "O",
    };
    return typeMap[type] || "O";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900">
          Budget Lines
        </h2>
        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Add Line
        </button>
      </div>

      <DataTable
        data={budgetLines}
        columns={columns}
        keyExtractor={(item) => item.id}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        emptyMessage="No budget lines found. Click 'Add Line' to get started."
      />

      <div className="flex justify-end border-t border-secondary-200 pt-4">
        <div className="text-right">
          <p className="text-sm text-secondary-600">Total Budget</p>
          <p className="text-2xl font-semibold text-secondary-900">
            {formatCurrency(
              budgetLines.reduce((sum, line) => sum + line.budgetedAmount, 0),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Variance Analysis con VarianceIndicator
// ============================================================================

export function VarianceAnalysisExample() {
  const variances = [
    { label: "Labor", budgeted: 4900000, actual: 5200000 },
    { label: "Materials", budgeted: 1600000, actual: 1450000 },
    { label: "Equipment", budgeted: 300000, actual: 320000 },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-secondary-900">
        Variance Analysis
      </h2>

      <div className="space-y-3">
        {variances.map((item) => {
          const variance = item.actual - item.budgeted;
          const variancePct = (variance / item.budgeted) * 100;

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-secondary-200 bg-white p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-secondary-900">{item.label}</p>
                <div className="mt-1 flex items-center gap-4 text-sm text-secondary-600">
                  <span>Budget: {formatCurrency(item.budgeted)}</span>
                  <span>Actual: {formatCurrency(item.actual)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <VarianceIndicator value={variance} format="currency" />
                <VarianceIndicator value={variancePct} format="percentage" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// EJEMPLO 6: Project Settings Form
// ============================================================================

export function ProjectSettingsFormExample() {
  const [name, setName] = useState("Citizens Medical Center");
  const [jobNumber, setJobNumber] = useState("23CON0002");
  const [contractAmount, setContractAmount] = useState<number>(15190000);
  const [budgetedGpPct, setBudgetedGpPct] = useState<number>(31.5);
  const [burdenPct, setBurdenPct] = useState<number>(45.0);
  const [status, setStatus] = useState<
    "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED"
  >("ACTIVE");

  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Job Number
          </label>
          <input
            type="text"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            className="block w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Contract Amount
          </label>
          <CurrencyInput
            value={contractAmount}
            onChange={(val) => setContractAmount(val ?? 0)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Budgeted GP %
          </label>
          <PercentageInput
            value={budgetedGpPct}
            onChange={(val) => setBudgetedGpPct(val ?? 0)}
            min={0}
            max={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Burden %
          </label>
          <PercentageInput
            value={burdenPct}
            onChange={(val) => setBurdenPct(val ?? 0)}
            min={0}
            max={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Status
          </label>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="block flex-1 rounded-md border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-secondary-200 pt-6">
        <button
          type="button"
          className="rounded-md border border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// EJEMPLO 7: Cost Type Legend
// ============================================================================

export function CostTypeLegendExample() {
  const costTypes: Array<"L" | "M" | "E" | "S" | "F" | "O"> = [
    "L",
    "M",
    "E",
    "S",
    "F",
    "O",
  ];

  return (
    <div className="rounded-lg border border-secondary-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-secondary-700">
        Cost Types
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {costTypes.map((type) => (
          <CostTypeIcon key={type} type={type} size="md" showLabel={true} />
        ))}
      </div>
    </div>
  );
}
