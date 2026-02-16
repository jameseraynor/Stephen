# Shared Components

Custom domain-specific components for the Cost Control System.

## Components

### CurrencyInput

Formatted input for currency values with automatic formatting.

```tsx
import { CurrencyInput } from "@/components/shared/CurrencyInput";

<CurrencyInput
  value={15190206}
  onChange={(value) => console.log(value)}
  placeholder="0.00"
/>;
```

**Features:**

- Automatic formatting with commas and decimals
- Dollar sign prefix
- Parses input on blur
- Returns number or null

---

### HoursInput

Input for hours with validation and formatting.

```tsx
import { HoursInput } from "@/components/shared/HoursInput";

<HoursInput
  value={8}
  onChange={(value) => console.log(value)}
  max={24}
  placeholder="0.0"
/>;
```

**Features:**

- Automatic formatting (1 decimal place)
- "hrs" suffix
- Min/max validation (0-24 by default)
- Returns number or null

---

### PercentageInput

Input for percentage values with validation.

```tsx
import { PercentageInput } from "@/components/shared/PercentageInput";

<PercentageInput
  value={31.5}
  onChange={(value) => console.log(value)}
  placeholder="0.0"
/>;
```

**Features:**

- Automatic formatting (1 decimal place)
- Percent sign suffix
- Range validation (0-100)
- Returns number or null

---

### MetricCard

Card component for displaying KPIs and metrics.

```tsx
import { MetricCard } from "@/components/shared/MetricCard";
import { DollarSign } from "lucide-react";

<MetricCard
  title="Total Contract Value"
  value="$15.2M"
  description="Citizens Medical Center"
  trend="up"
  trendValue="+2.3%"
  icon={<DollarSign className="h-4 w-4" />}
/>;
```

**Props:**

- `title`: Card title
- `value`: Main metric value (string or number)
- `description`: Optional description text
- `trend`: "up" | "down" | "neutral"
- `trendValue`: Optional trend value text
- `icon`: Optional icon element

---

### StatusBadge

Badge component for project status.

```tsx
import { StatusBadge } from "@/components/shared/StatusBadge";

<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="on-hold" />
<StatusBadge status="cancelled" />
```

**Status Types:**

- `active`: Green badge
- `completed`: Blue badge
- `on-hold`: Yellow badge
- `cancelled`: Gray badge

---

### VarianceIndicator

Visual indicator for variance values with color coding.

```tsx
import { VarianceIndicator } from "@/components/shared/VarianceIndicator";

<VarianceIndicator value={15.5} />  // Positive (green)
<VarianceIndicator value={-8.2} />  // Negative (red)
<VarianceIndicator value={0} />     // Neutral (gray)
<VarianceIndicator value={5.3} showIcon={false} />
```

**Props:**

- `value`: Variance value (number)
- `showIcon`: Show trend icon (default: true)
- `showSign`: Show +/- sign (default: true)

---

### CostTypeIcon

Icon component for cost types (Labor, Material, Equipment, Subcontractor, Other).

```tsx
import { CostTypeIcon } from "@/components/shared/CostTypeIcon";

<CostTypeIcon type="L" showLabel />  // Labor
<CostTypeIcon type="M" showLabel />  // Material
<CostTypeIcon type="E" showLabel />  // Equipment
<CostTypeIcon type="S" showLabel />  // Subcontractor
<CostTypeIcon type="O" showLabel />  // Other
```

**Cost Types:**

- `L`: Labor (blue, Users icon)
- `M`: Material (yellow, Package icon)
- `E`: Equipment (green, Wrench icon)
- `S`: Subcontractor (gray, DollarSign icon)
- `O`: Other (light gray, Boxes icon)

---

### ProgressBar

Progress bar for budget vs actual visualization.

```tsx
import { ProgressBar } from "@/components/shared/ProgressBar";

<ProgressBar value={75} max={100} showLabel />
<ProgressBar value={50} variant="success" showLabel />
<ProgressBar value={85} variant="warning" showLabel />
<ProgressBar value={110} variant="danger" showLabel />
```

**Props:**

- `value`: Current value
- `max`: Maximum value (default: 100)
- `showLabel`: Show value labels (default: false)
- `variant`: "default" | "success" | "warning" | "danger"

---

## Usage Guidelines

### When to Use Custom Components

- **CurrencyInput**: For all monetary values (contract amounts, costs, etc.)
- **HoursInput**: For time entry fields (ST, OT, DT hours)
- **PercentageInput**: For GP%, burden%, completion%
- **MetricCard**: For dashboard KPIs and summary metrics
- **StatusBadge**: For project status display in tables and cards
- **VarianceIndicator**: For showing budget vs actual variances
- **CostTypeIcon**: For identifying cost code types in tables
- **ProgressBar**: For showing progress or budget consumption

### Styling

All components support the `className` prop for custom styling:

```tsx
<CurrencyInput className="w-full" />
<MetricCard className="border-primary-500" />
```

### Accessibility

All components follow accessibility best practices:

- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

---

## Testing

See `testing-guidelines.md` for testing patterns for these components.

Example test:

```tsx
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

test("renders metric card with value", () => {
  render(<MetricCard title="Total" value="$15.2M" />);
  expect(screen.getByText("Total")).toBeInTheDocument();
  expect(screen.getByText("$15.2M")).toBeInTheDocument();
});
```
