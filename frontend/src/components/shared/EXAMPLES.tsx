/**
 * Component Usage Examples
 *
 * This file contains practical examples of how to use the custom shared components
 * in real-world scenarios for the Cost Control System.
 */

import { useState } from "react";
import { CurrencyInput } from "./CurrencyInput";
import { HoursInput } from "./HoursInput";
import { PercentageInput } from "./PercentageInput";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { VarianceIndicator } from "./VarianceIndicator";
import { CostTypeIcon } from "./CostTypeIcon";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users } from "lucide-react";

// ============================================================================
// EXAMPLE 1: Budget Entry Form
// ============================================================================
export function BudgetEntryFormExample() {
  const [budgetAmount, setBudgetAmount] = useState<number | null>(50000);
  const [gpPercentage, setGpPercentage] = useState<number | null>(31.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Budget Amount:", budgetAmount);
    console.log("GP Percentage:", gpPercentage);
    // API call would go here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Entry Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budget-amount">Budget Amount</Label>
            <CurrencyInput
              id="budget-amount"
              value={budgetAmount ?? undefined}
              onChange={setBudgetAmount}
              placeholder="Enter budget amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gp-percentage">Target GP%</Label>
            <PercentageInput
              id="gp-percentage"
              value={gpPercentage ?? undefined}
              onChange={setGpPercentage}
              placeholder="Enter GP percentage"
            />
          </div>
          <Button type="submit">Save Budget Line</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 2: Time Entry Form
// ============================================================================
export function TimeEntryFormExample() {
  const [hoursST, setHoursST] = useState<number | null>(8);
  const [hoursOT, setHoursOT] = useState<number | null>(0);
  const [hoursDT, setHoursDT] = useState<number | null>(0);

  const totalHours = (hoursST ?? 0) + (hoursOT ?? 0) + (hoursDT ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ST Hours:", hoursST);
    console.log("OT Hours:", hoursOT);
    console.log("DT Hours:", hoursDT);
    console.log("Total Hours:", totalHours);
    // API call would go here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Time Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="hours-st">Straight Time</Label>
              <HoursInput
                id="hours-st"
                value={hoursST ?? undefined}
                onChange={setHoursST}
                max={24}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-ot">Overtime (1.5x)</Label>
              <HoursInput
                id="hours-ot"
                value={hoursOT ?? undefined}
                onChange={setHoursOT}
                max={24}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-dt">Double Time (2x)</Label>
              <HoursInput
                id="hours-dt"
                value={hoursDT ?? undefined}
                onChange={setHoursDT}
                max={24}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">
              Total Hours: {totalHours.toFixed(1)}
            </span>
            <Button type="submit">Save Time Entry</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 3: Dashboard Metrics
// ============================================================================
export function DashboardMetricsExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Contract Value"
        value="$15,190,206"
        description="Citizens Medical Center"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <MetricCard
        title="Budgeted GP%"
        value="31.5%"
        trend="up"
        trendValue="+2.3%"
        description="vs last month"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <MetricCard
        title="Total Labor Hours"
        value="12,450"
        trend="down"
        trendValue="-5.2%"
        description="this month"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Budget Consumed"
        value="68%"
        trend="neutral"
        description="on track"
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Project Status Display
// ============================================================================
export function ProjectStatusExample() {
  const projects = [
    { id: "1", name: "Citizens Medical Center", status: "active" as const },
    { id: "2", name: "Downtown Office Complex", status: "active" as const },
    { id: "3", name: "Riverside Apartments", status: "completed" as const },
    { id: "4", name: "Tech Campus Phase 2", status: "on-hold" as const },
    { id: "5", name: "Old Warehouse Renovation", status: "cancelled" as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span className="font-medium">{project.name}</span>
              <StatusBadge status={project.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 5: Budget vs Actual Comparison
// ============================================================================
export function BudgetActualComparisonExample() {
  const costCodes = [
    {
      code: "L-001",
      name: "Project Manager",
      type: "L" as const,
      budget: 50000,
      actual: 37500,
      variance: 25.0,
    },
    {
      code: "M-101",
      name: "Concrete",
      type: "M" as const,
      budget: 150000,
      actual: 165000,
      variance: -10.0,
    },
    {
      code: "E-201",
      name: "Excavator",
      type: "E" as const,
      budget: 25000,
      actual: 22500,
      variance: 10.0,
    },
    {
      code: "S-301",
      name: "Electrical Sub",
      type: "S" as const,
      budget: 80000,
      actual: 80000,
      variance: 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {costCodes.map((item) => (
            <div key={item.code} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CostTypeIcon type={item.type} />
                  <div>
                    <div className="font-medium">{item.code}</div>
                    <div className="text-sm text-neutral-500">{item.name}</div>
                  </div>
                </div>
                <VarianceIndicator value={item.variance} />
              </div>
              <ProgressBar
                value={item.actual}
                max={item.budget}
                showLabel
                variant={
                  item.variance > 0
                    ? "success"
                    : item.variance < -5
                      ? "danger"
                      : item.variance < 0
                        ? "warning"
                        : "default"
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 6: Cost Type Legend
// ============================================================================
export function CostTypeLegendExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Code Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CostTypeIcon type="L" showLabel />
            <span className="text-sm text-neutral-600">
              Direct labor costs including wages and burden
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CostTypeIcon type="M" showLabel />
            <span className="text-sm text-neutral-600">
              Materials and supplies for construction
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CostTypeIcon type="E" showLabel />
            <span className="text-sm text-neutral-600">
              Equipment rental and operating costs
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CostTypeIcon type="S" showLabel />
            <span className="text-sm text-neutral-600">
              Subcontractor labor and services
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <CostTypeIcon type="O" showLabel />
            <span className="text-sm text-neutral-600">
              Other miscellaneous costs and expenses
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 7: Variance Summary
// ============================================================================
export function VarianceSummaryExample() {
  const variances = [
    { category: "Labor", variance: 15.5, description: "Under budget" },
    { category: "Materials", variance: -8.2, description: "Over budget" },
    { category: "Equipment", variance: 0, description: "On budget" },
    { category: "Subcontractors", variance: 5.3, description: "Under budget" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {variances.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div>
                <div className="font-medium">{item.category}</div>
                <div className="text-sm text-neutral-500">
                  {item.description}
                </div>
              </div>
              <VarianceIndicator value={item.variance} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXAMPLE 8: Complete Project Form
// ============================================================================
export function CompleteProjectFormExample() {
  const [projectName, setProjectName] = useState("");
  const [contractAmount, setContractAmount] = useState<number | null>(null);
  const [budgetedGP, setBudgetedGP] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      projectName,
      contractAmount,
      budgetedGP,
    });
    // API call would go here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter project name"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-amount">Contract Amount</Label>
              <CurrencyInput
                id="contract-amount"
                value={contractAmount ?? undefined}
                onChange={setContractAmount}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgeted-gp">Budgeted GP%</Label>
              <PercentageInput
                id="budgeted-gp"
                value={budgetedGP ?? undefined}
                onChange={setBudgetedGP}
                placeholder="0.0"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
