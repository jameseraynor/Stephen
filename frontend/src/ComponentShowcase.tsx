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
} from "./components/shared";
import { formatCurrency, formatHours } from "./utils/formatters";
import { Project, BudgetLine, CostCode } from "./types";

// Mock data
const mockCostCodes: CostCode[] = [
  {
    id: "1",
    code: "01100",
    description: "Project Manager",
    type: "LABOR",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "02100",
    description: "Journeyman Electrician",
    type: "LABOR",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    code: "03100",
    description: "Wire & Cable",
    type: "MATERIAL",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    code: "04100",
    description: "Boom Lift 40ft",
    type: "EQUIPMENT",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    code: "05100",
    description: "Electrical Subcontractor",
    type: "SUBCONTRACTOR",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockProject: Project = {
  id: "1",
  name: "Citizens Medical Center",
  jobNumber: "23CON0002",
  contractAmount: 15190000,
  budgetedGpPct: 31.5,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockBudgetLines: BudgetLine[] = [
  {
    id: "1",
    projectId: "1",
    costCodeId: "1",
    costCode: mockCostCodes[0],
    budgetedAmount: 187200,
    budgetedQuantity: 2080,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    projectId: "1",
    costCodeId: "2",
    costCode: mockCostCodes[1],
    budgetedAmount: 1122000,
    budgetedQuantity: 18720,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    projectId: "1",
    costCodeId: "3",
    costCode: mockCostCodes[2],
    budgetedAmount: 892000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ComponentShowcase() {
  const [selectedCostCode, setSelectedCostCode] = useState("");
  const [currencyValue, setCurrencyValue] = useState<number>(15190000);
  const [percentageValue, setPercentageValue] = useState<number>(31.5);
  const [hoursValue, setHoursValue] = useState<number>(2080);

  const columns: Column<BudgetLine>[] = [
    {
      key: "code",
      header: "Code",
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
      render: (item) => item.costCode?.description,
    },
    {
      key: "hours",
      header: "Hours",
      align: "right",
      render: (item) =>
        item.budgetedQuantity ? formatHours(item.budgetedQuantity) : "-",
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (item) => formatCurrency(item.budgetedAmount),
    },
  ];

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
    <div className="space-y-12">
      {/* Section 1: Metric Cards */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          1. Metric Cards (Dashboard KPIs)
        </h2>
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
      </section>

      {/* Section 2: Project Card */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          2. Project Card
        </h2>
        <div className="max-w-md">
          <ProjectCard
            project={mockProject}
            onClick={(p) => alert(`Clicked project: ${p.name}`)}
          />
        </div>
      </section>

      {/* Section 3: Status Badges */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          3. Status Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="ACTIVE" />
          <StatusBadge status="COMPLETED" />
          <StatusBadge status="ON_HOLD" />
          <StatusBadge status="CANCELLED" />
        </div>
      </section>

      {/* Section 4: Cost Type Icons */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          4. Cost Type Icons
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <CostTypeIcon type="L" size="md" showLabel={true} />
          <CostTypeIcon type="M" size="md" showLabel={true} />
          <CostTypeIcon type="E" size="md" showLabel={true} />
          <CostTypeIcon type="S" size="md" showLabel={true} />
          <CostTypeIcon type="F" size="md" showLabel={true} />
          <CostTypeIcon type="O" size="md" showLabel={true} />
        </div>
      </section>

      {/* Section 5: Variance Indicators */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          5. Variance Indicators
        </h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-2 text-sm text-secondary-600">
              Positive (Currency)
            </p>
            <VarianceIndicator value={15000} format="currency" />
          </div>
          <div>
            <p className="mb-2 text-sm text-secondary-600">
              Negative (Currency)
            </p>
            <VarianceIndicator value={-25000} format="currency" />
          </div>
          <div>
            <p className="mb-2 text-sm text-secondary-600">
              Positive (Percentage)
            </p>
            <VarianceIndicator value={5.2} format="percentage" />
          </div>
          <div>
            <p className="mb-2 text-sm text-secondary-600">
              Negative (Percentage)
            </p>
            <VarianceIndicator value={-17.1} format="percentage" />
          </div>
        </div>
      </section>

      {/* Section 6: Input Components */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          6. Specialized Inputs (Prueba editarlos)
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-700">
              Currency Input
            </label>
            <CurrencyInput
              value={currencyValue}
              onChange={(val) => setCurrencyValue(val ?? 0)}
              placeholder="0.00"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Valor: {currencyValue}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-700">
              Percentage Input
            </label>
            <PercentageInput
              value={percentageValue}
              onChange={(val) => setPercentageValue(val ?? 0)}
              min={0}
              max={100}
            />
            <p className="mt-1 text-xs text-secondary-500">
              Valor: {percentageValue}%
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-secondary-700">
              Hours Input
            </label>
            <HoursInput
              value={hoursValue}
              onChange={(val) => setHoursValue(val ?? 0)}
              placeholder="0.0"
            />
            <p className="mt-1 text-xs text-secondary-500">
              Valor: {hoursValue} hrs
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Cost Code Select */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          7. Cost Code Select (con búsqueda)
        </h2>
        <div className="max-w-md">
          <CostCodeSelect
            costCodes={mockCostCodes}
            value={selectedCostCode}
            onChange={setSelectedCostCode}
            placeholder="Busca por código o descripción..."
          />
          {selectedCostCode && (
            <p className="mt-2 text-sm text-secondary-600">
              Seleccionado:{" "}
              {mockCostCodes.find((cc) => cc.id === selectedCostCode)?.code}
            </p>
          )}
        </div>
      </section>

      {/* Section 8: Data Table */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          8. Data Table (con sorting y zebra striping)
        </h2>
        <DataTable
          data={mockBudgetLines}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => alert(`Clicked: ${item.costCode?.description}`)}
          emptyMessage="No budget lines found"
        />
        <div className="mt-4 flex justify-end border-t border-secondary-200 pt-4">
          <div className="text-right">
            <p className="text-sm text-secondary-600">Total Budget</p>
            <p className="text-2xl font-semibold text-secondary-900">
              {formatCurrency(
                mockBudgetLines.reduce(
                  (sum, line) => sum + line.budgetedAmount,
                  0,
                ),
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-secondary-200 pt-8">
        <div className="rounded-lg bg-primary-50 p-6">
          <h3 className="text-lg font-semibold text-primary-900">
            ✅ Todos los componentes están listos
          </h3>
          <p className="mt-2 text-sm text-primary-700">
            Estos 10 componentes cubren todas las necesidades de los wireframes
            del MVP. Cuando tengas aprobación de diseño, crear páginas será
            principalmente composición de estos building blocks.
          </p>
          <div className="mt-4 flex gap-4 text-sm text-primary-700">
            <span>📁 Ver: frontend/src/components/shared/README.md</span>
            <span>
              📚 Ejemplos: frontend/src/components/shared/EXAMPLES.tsx
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
