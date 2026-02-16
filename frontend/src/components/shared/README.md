# Shared Components Library

Componentes reutilizables para el sistema de Cost Control. Todos siguen las convenciones del Design System y están listos para usar en las páginas.

## Componentes Disponibles

### 1. CurrencyInput

Input formateado para valores monetarios con símbolo de dólar.

```tsx
import { CurrencyInput } from "@/components/shared";

function BudgetForm() {
  const [amount, setAmount] = useState<number>(0);

  return (
    <CurrencyInput
      value={amount}
      onChange={setAmount}
      placeholder="0.00"
      error={errors.amount}
    />
  );
}
```

**Props:**

- `value?: number` - Valor numérico
- `onChange?: (value: number | null) => void` - Callback cuando cambia
- `error?: string` - Mensaje de error
- Todos los props de `<input>` estándar

**Features:**

- Formatea automáticamente con comas y decimales
- Parsea input del usuario removiendo caracteres no numéricos
- Alineación a la derecha (estilo financiero)
- Símbolo $ fijo a la izquierda

---

### 2. PercentageInput

Input para porcentajes con símbolo % y validación de rango.

```tsx
import { PercentageInput } from "@/components/shared";

function ProjectForm() {
  const [gpPct, setGpPct] = useState<number>(31.5);

  return (
    <PercentageInput
      value={gpPct}
      onChange={setGpPct}
      min={0}
      max={100}
      error={errors.gpPct}
    />
  );
}
```

**Props:**

- `value?: number` - Valor numérico (31.5 para 31.5%)
- `onChange?: (value: number | null) => void`
- `min?: number` - Valor mínimo (default: 0)
- `max?: number` - Valor máximo (default: 100)
- `error?: string`

---

### 3. HoursInput

Input para horas con formato decimal y sufijo "hrs".

```tsx
import { HoursInput } from "@/components/shared";

function TimeEntry() {
  const [hours, setHours] = useState<number>(8);

  return <HoursInput value={hours} onChange={setHours} placeholder="0.0" />;
}
```

**Props:**

- `value?: number`
- `onChange?: (value: number | null) => void`
- `error?: string`

**Features:**

- Solo acepta números positivos
- Formato con 1 decimal
- Sufijo "hrs" fijo

---

### 4. CostCodeSelect

Select con búsqueda para cost codes, muestra código, tipo e icono.

```tsx
import { CostCodeSelect } from "@/components/shared";

function BudgetEntry() {
  const [costCodeId, setCostCodeId] = useState<string>("");

  return (
    <CostCodeSelect
      costCodes={costCodes}
      value={costCodeId}
      onChange={setCostCodeId}
      placeholder="Select cost code..."
      error={errors.costCode}
    />
  );
}
```

**Props:**

- `costCodes: CostCode[]` - Array de cost codes
- `value?: string` - ID del cost code seleccionado
- `onChange: (costCodeId: string) => void`
- `placeholder?: string`
- `error?: string`
- `disabled?: boolean`

**Features:**

- Búsqueda en tiempo real por código o descripción
- Muestra icono de tipo de costo (L, M, E, S, F, O)
- Dropdown con scroll para listas largas
- Click fuera para cerrar

---

### 5. StatusBadge

Badge para mostrar estados de proyecto con colores semánticos.

```tsx
import { StatusBadge } from "@/components/shared";

function ProjectCard() {
  return <StatusBadge status="ACTIVE" />;
}
```

**Props:**

- `status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'`
- `className?: string`

**Colores:**

- ACTIVE: Verde
- COMPLETED: Gris
- ON_HOLD: Amarillo
- CANCELLED: Rojo

---

### 6. CostTypeIcon

Icono circular con letra para tipos de costo.

```tsx
import { CostTypeIcon } from "@/components/shared";

function BudgetLine() {
  return <CostTypeIcon type="L" size="md" showLabel={true} />;
}
```

**Props:**

- `type: 'L' | 'M' | 'E' | 'S' | 'F' | 'O'`
- `size?: 'sm' | 'md' | 'lg'` (default: 'md')
- `showLabel?: boolean` (default: false)
- `className?: string`

**Tipos:**

- L: Labor (Azul)
- M: Materials (Verde)
- E: Equipment (Amarillo)
- S: Subcontract (Morado)
- F: PM (Rosa)
- O: Other (Gris)

---

### 7. VarianceIndicator

Indicador de varianza con color y flecha según positivo/negativo.

```tsx
import { VarianceIndicator } from "@/components/shared";

function Dashboard() {
  return <VarianceIndicator value={-15000} format="currency" showSign={true} />;
}
```

**Props:**

- `value: number` - Valor de varianza
- `format?: 'currency' | 'percentage' | 'number'` (default: 'currency')
- `showSign?: boolean` (default: true)
- `className?: string`

**Features:**

- Verde para positivo (↑)
- Rojo para negativo (↓)
- Gris para cero
- Formatea según tipo especificado

---

### 8. MetricCard

Card para mostrar métricas/KPIs en dashboard.

```tsx
import { MetricCard } from "@/components/shared";

function Dashboard() {
  return (
    <MetricCard
      title="Contract Amount"
      value="$15.19M"
      subtitle="Original contract"
      trend="up"
      trendValue="+5.2%"
      icon={<DollarIcon />}
    />
  );
}
```

**Props:**

- `title: string` - Título de la métrica
- `value: string | number` - Valor principal
- `subtitle?: string` - Texto secundario
- `icon?: ReactNode` - Icono opcional
- `trend?: 'up' | 'down' | 'neutral'`
- `trendValue?: string` - Texto del trend
- `className?: string`

---

### 9. ProjectCard

Card para mostrar resumen de proyecto en lista.

```tsx
import { ProjectCard } from "@/components/shared";

function ProjectList() {
  return (
    <ProjectCard
      project={project}
      onClick={(p) => navigate(`/projects/${p.id}`)}
    />
  );
}
```

**Props:**

- `project: Project` - Objeto de proyecto
- `onClick?: (project: Project) => void`
- `className?: string`

**Muestra:**

- Nombre y job number
- Status badge
- Contract amount
- Budgeted GP%
- Fechas de inicio/fin

---

### 10. DataTable

Tabla genérica con sorting, zebra striping y click en filas.

```tsx
import { DataTable, Column } from "@/components/shared";

function BudgetList() {
  const columns: Column<BudgetLine>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      render: (item) => (
        <span className="font-mono">{item.costCode?.code}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      render: (item) => formatCurrency(item.budgetedAmount),
    },
  ];

  return (
    <DataTable
      data={budgetLines}
      columns={columns}
      keyExtractor={(item) => item.id}
      onRowClick={(item) => handleEdit(item)}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      emptyMessage="No budget lines found"
    />
  );
}
```

**Props:**

- `data: T[]` - Array de datos
- `columns: Column<T>[]` - Definición de columnas
- `keyExtractor: (item: T) => string` - Función para obtener key única
- `onRowClick?: (item: T) => void` - Click en fila
- `sortBy?: string` - Columna actual de sort
- `sortOrder?: 'asc' | 'desc'`
- `onSort?: (key: string) => void` - Callback de sort
- `emptyMessage?: string`
- `className?: string`

**Column Interface:**

```tsx
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
}
```

---

## Utilidades de Formato

Todas las funciones de formato están en `@/utils/formatters`:

```tsx
import {
  formatCurrency, // $15,190,000
  formatCurrencyDetailed, // $15,190,000.00
  formatPercentage, // 31.5%
  formatHours, // 1,234.5
  formatNumber, // 1,234
  formatDate, // 01/15/2025
  formatMonthYear, // Jan 2026
} from "@/utils/formatters";
```

---

## Ejemplo Completo: Budget Entry Form

```tsx
import { useState } from "react";
import {
  CostCodeSelect,
  CurrencyInput,
  HoursInput,
  DataTable,
  Column,
} from "@/components/shared";
import { formatCurrency } from "@/utils/formatters";

function BudgetEntryForm() {
  const [costCodeId, setCostCodeId] = useState("");
  const [hours, setHours] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);

  const columns: Column<BudgetLine>[] = [
    {
      key: "code",
      header: "Code",
      render: (item) => item.costCode?.code,
    },
    {
      key: "hours",
      header: "Hours",
      align: "right",
      render: (item) => formatHours(item.budgetedQuantity),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (item) => formatCurrency(item.budgetedAmount),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700">
            Cost Code
          </label>
          <CostCodeSelect
            costCodes={costCodes}
            value={costCodeId}
            onChange={setCostCodeId}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">
            Hours
          </label>
          <HoursInput value={hours} onChange={setHours} />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">
            Amount
          </label>
          <CurrencyInput value={amount} onChange={setAmount} />
        </div>
      </div>

      <DataTable
        data={budgetLines}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
```

---

## Notas de Implementación

1. **Todos los componentes usan TypeScript estricto** - Props completamente tipados
2. **Siguen el Design System** - Colores, spacing, y estilos consistentes
3. **Accesibles** - Labels, ARIA attributes, keyboard navigation
4. **Responsive** - Funcionan en desktop y tablet
5. **Testeables** - Estructura simple para unit tests

## Próximos Pasos

Cuando estés listo para crear páginas:

1. Importa los componentes necesarios
2. Compón la UI usando estos building blocks
3. Agrega lógica de negocio y API calls
4. Las páginas serán principalmente "composición" de estos componentes

¿Necesitas algún componente adicional o modificación?
