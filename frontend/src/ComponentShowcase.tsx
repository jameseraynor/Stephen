import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// Custom shared components
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { HoursInput } from "@/components/shared/HoursInput";
import { PercentageInput } from "@/components/shared/PercentageInput";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VarianceIndicator } from "@/components/shared/VarianceIndicator";
import { CostTypeIcon } from "@/components/shared/CostTypeIcon";
import { ProgressBar } from "@/components/shared/ProgressBar";

import { DollarSign, TrendingUp, Users, Package } from "lucide-react";

export function ComponentShowcase() {
  const { toast } = useToast();
  const [currency, setCurrency] = useState<number | null>(15190206);
  const [hours, setHours] = useState<number | null>(8);
  const [percentage, setPercentage] = useState<number | null>(31.5);

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Cost Control System - Component Library
          </h1>
          <p className="text-neutral-500">
            Complete UI component showcase with shadcn/ui + custom components
          </p>
        </div>

        {/* Metric Cards */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Metric Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Contract Value"
              value="$15.2M"
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
              title="Total Hours"
              value="12,450"
              trend="down"
              trendValue="-5.2%"
              description="this month"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Material Cost"
              value="$2.8M"
              trend="neutral"
              description="on budget"
              icon={<Package className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Custom Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Input Components</CardTitle>
            <CardDescription>
              Specialized inputs for currency, hours, and percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Contract Amount</Label>
                <CurrencyInput
                  id="currency"
                  value={currency ?? undefined}
                  onChange={setCurrency}
                  placeholder="0.00"
                />
                <p className="text-xs text-neutral-500">
                  Value: {currency ?? "null"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Worked</Label>
                <HoursInput
                  id="hours"
                  value={hours ?? undefined}
                  onChange={setHours}
                  placeholder="0.0"
                />
                <p className="text-xs text-neutral-500">
                  Value: {hours ?? "null"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">GP Percentage</Label>
                <PercentageInput
                  id="percentage"
                  value={percentage ?? undefined}
                  onChange={setPercentage}
                  placeholder="0.0"
                />
                <p className="text-xs text-neutral-500">
                  Value: {percentage ?? "null"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Badges & Indicators */}
        <Card>
          <CardHeader>
            <CardTitle>Status Badges & Variance Indicators</CardTitle>
            <CardDescription>
              Visual indicators for project status and variances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="active" />
                <StatusBadge status="completed" />
                <StatusBadge status="on-hold" />
                <StatusBadge status="cancelled" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Variance Indicators</h3>
              <div className="flex flex-wrap gap-4">
                <VarianceIndicator value={15.5} />
                <VarianceIndicator value={-8.2} />
                <VarianceIndicator value={0} />
                <VarianceIndicator value={5.3} showIcon={false} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Cost Type Icons</h3>
              <div className="flex flex-wrap gap-4">
                <CostTypeIcon type="L" showLabel />
                <CostTypeIcon type="M" showLabel />
                <CostTypeIcon type="E" showLabel />
                <CostTypeIcon type="S" showLabel />
                <CostTypeIcon type="O" showLabel />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Bars</CardTitle>
            <CardDescription>
              Visual representation of budget vs actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Progress (75%)</Label>
              <ProgressBar value={75} showLabel />
            </div>
            <div className="space-y-2">
              <Label>On Track (50%)</Label>
              <ProgressBar value={50} variant="success" showLabel />
            </div>
            <div className="space-y-2">
              <Label>Warning (85%)</Label>
              <ProgressBar value={85} variant="warning" showLabel />
            </div>
            <div className="space-y-2">
              <Label>Over Budget (110%)</Label>
              <ProgressBar value={110} variant="danger" showLabel />
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Different button variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button
              onClick={() =>
                toast({
                  title: "Success!",
                  description: "This is a toast notification",
                })
              }
            >
              Show Toast
            </Button>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Inputs, labels, and selects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" placeholder="Enter project name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Modal dialogs</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Enter the details for your new project
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-name">Project Name</Label>
                    <Input
                      id="dialog-name"
                      placeholder="Citizens Medical Center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-job">Job Number</Label>
                    <Input id="dialog-job" placeholder="23CON0002" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>Tabbed content</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="budget">
              <TabsList>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="actuals">Actuals</TabsTrigger>
                <TabsTrigger value="projections">Projections</TabsTrigger>
              </TabsList>
              <TabsContent value="budget" className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Budget information will be displayed here
                </p>
              </TabsContent>
              <TabsContent value="actuals" className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Actual costs will be displayed here
                </p>
              </TabsContent>
              <TabsContent value="projections" className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Cost projections will be displayed here
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>
              Project listing with status badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Recent projects</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Number</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Contract Amount</TableHead>
                  <TableHead className="text-right">GP%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">23CON0002</TableCell>
                  <TableCell>Citizens Medical Center</TableCell>
                  <TableCell>
                    <CostTypeIcon type="L" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                  <TableCell className="text-right">$15,190,206</TableCell>
                  <TableCell className="text-right">
                    <VarianceIndicator value={31.5} showIcon={false} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24CON0015</TableCell>
                  <TableCell>Downtown Office Complex</TableCell>
                  <TableCell>
                    <CostTypeIcon type="M" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="active" />
                  </TableCell>
                  <TableCell className="text-right">$8,500,000</TableCell>
                  <TableCell className="text-right">
                    <VarianceIndicator value={28.2} showIcon={false} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">24CON0023</TableCell>
                  <TableCell>Riverside Apartments</TableCell>
                  <TableCell>
                    <CostTypeIcon type="E" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="completed" />
                  </TableCell>
                  <TableCell className="text-right">$12,000,000</TableCell>
                  <TableCell className="text-right">
                    <VarianceIndicator value={-2.5} showIcon={false} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}
