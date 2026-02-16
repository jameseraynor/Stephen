# Shared Components

Custom domain-specific components for the Cost Control System. All components are fully accessible and follow WCAG 2.1 Level AA guidelines.

## Accessibility Features

All components in this directory include:

- ✅ **Screen reader support** with proper ARIA labels
- ✅ **Keyboard navigation** (Tab, Enter, Space, Escape, Arrows)
- ✅ **Focus management** with visible focus indicators
- ✅ **Color contrast** meeting WCAG AA standards (4.5:1 minimum)
- ✅ **Semantic HTML** with proper roles and landmarks
- ✅ **Error announcements** with `role="alert"`
- ✅ **Loading states** with `aria-live` regions
- ✅ **Reduced motion** support via `prefers-reduced-motion`

For detailed accessibility documentation, see [ACCESSIBILITY.md](../../ACCESSIBILITY.md).

---

## Components

### Input Components

#### CurrencyInput

Formatted input for currency values with automatic formatting.

**Accessibility:**

- Hidden `<label>` for screen readers
- `aria-label` describes input purpose
- `aria-describedby` links to format hint
- `sr-only` hint explains expected format
- Dollar sign marked `aria-hidden="true"`

```tsx
import { CurrencyInput } from "@/components/shared/CurrencyInput";

<CurrencyInput
  value={15190206}
  onChange={(value) => console.log(value)}
  placeholder="0.00"
/>;
// Screen reader: "Currency amount in dollars, Enter amount in dollars and cents, for example 1234.56"
```

**Features:**

- Automatic formatting with commas and decimals
- Dollar sign prefix
- Parses input on blur
- Returns number or null

---

#### HoursInput

Input for hours with validation and formatting.

**Accessibility:**

- Hidden `<label>` for screen readers
- `aria-label` and `aria-describedby` for context
- `sr-only` hint explains format and maximum
- "hrs" suffix marked `aria-hidden="true"`

```tsx
import { HoursInput } from "@/components/shared/HoursInput";

<HoursInput
  value={8}
  onChange={(value) => console.log(value)}
  max={24}
  placeholder="0.0"
/>;
// Screen reader: "Hours worked, Enter hours as a decimal number, maximum 24 hours"
```

**Features:**

- Automatic formatting (1 decimal place)
- "hrs" suffix
- Min/max validation (0-24 by default)
- Returns number or null

---

#### PercentageInput

Input for percentage values with validation.

**Accessibility:**

- Hidden `<label>` for screen readers
- `aria-label` and `aria-describedby` for context
- `sr-only` hint explains valid range
- Percent sign marked `aria-hidden="true"`

```tsx
import { PercentageInput } from "@/components/shared/PercentageInput";

<PercentageInput
  value={31.5}
  onChange={(value) => console.log(value)}
  placeholder="0.0"
/>;
// Screen reader: "Percentage value, Enter percentage between 0 and 100"
```

**Features:**

- Automatic formatting (1 decimal place)
- Percent sign suffix
- Range validation (0-100)
- Returns number or null

---

#### CostCodeSelect

Searchable dropdown for selecting cost codes.

**Accessibility:**

- `aria-haspopup="listbox"` indicates dropdown
- `aria-expanded` reflects open/closed state
- `aria-describedby` links to error messages
- Search input has proper `<label>` and `aria-label`
- Dropdown has `role="dialog"` and `aria-label`
- Options list has `role="listbox"` with `role="option"` items
- `aria-selected` indicates current selection
- Empty state has `role="status"` with `aria-live="polite"`
- Error messages have `role="alert"`

**Keyboard Navigation:**

- Enter/Space: Open dropdown
- Escape: Close dropdown
- Type to search when open
- Tab: Navigate between elements

```tsx
import { CostCodeSelect } from "@/components/shared/CostCodeSelect";

<CostCodeSelect
  costCodes={costCodes}
  value={selectedId}
  onChange={setSelectedId}
  placeholder="Select cost code..."
  error={error}
/>;
// Screen reader: "Select cost code, Cost code selection dialog"
// Keyboard: Enter to open, type to search, Escape to close
```

---

### Display Components

#### MetricCard

Card component for displaying KPIs and metrics.

**Accessibility:**

- `role="article"` for semantic structure
- Comprehensive `aria-label` on card
- Trend icons marked `aria-hidden="true"` with text alternatives

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
// Screen reader: "Metric: Total Contract Value, Value: $15.2M, Trending up: +2.3%"
```

**Props:**

- `title`: Card title
- `value`: Main metric value (string or number)
- `description`: Optional description text
- `trend`: "up" | "down" | "neutral"
- `trendValue`: Optional trend value text
- `icon`: Optional icon element

---

#### StatusBadge

Badge component for project status.

**Accessibility:**

- `role="status"` for status indicators
- Full context in `aria-label`: "Project status: Active"

```tsx
import { StatusBadge } from "@/components/shared/StatusBadge";

<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="on-hold" />
<StatusBadge status="cancelled" />
// Screen reader: "Project status: Active"
```

**Status Types:**

- `active`: Green badge
- `completed`: Blue badge
- `on-hold`: Yellow badge
- `cancelled`: Gray badge

---

#### VarianceIndicator

Visual indicator for variance values with color coding.

**Accessibility:**

- `role="status"` for variance information
- Descriptive `aria-label`: "Positive variance: 5.2 percent above target"
- Icons marked `aria-hidden="true"`

```tsx
import { VarianceIndicator } from "@/components/shared/VarianceIndicator";

<VarianceIndicator value={15.5} />  // Positive (green)
<VarianceIndicator value={-8.2} />  // Negative (red)
<VarianceIndicator value={0} />     // Neutral (gray)
<VarianceIndicator value={5.3} showIcon={false} />
// Screen reader: "Positive variance: 15.5 percent above target"
```

**Props:**

- `value`: Variance value (number)
- `showIcon`: Show trend icon (default: true)
- `showSign`: Show +/- sign (default: true)

---

#### CostTypeIcon

Icon component for cost types (Labor, Material, Equipment, Subcontractor, Other).

**Accessibility:**

- `role="img"` with descriptive `aria-label`
- Hidden label for screen readers when visual label not shown
- Icons marked `aria-hidden="true"`

```tsx
import { CostTypeIcon } from "@/components/shared/CostTypeIcon";

<CostTypeIcon type="L" showLabel />  // Labor
<CostTypeIcon type="M" showLabel />  // Material
<CostTypeIcon type="E" showLabel />  // Equipment
<CostTypeIcon type="S" showLabel />  // Subcontractor
<CostTypeIcon type="O" showLabel />  // Other
// Screen reader: "Cost type: Labor"
```

**Cost Types:**

- `L`: Labor (blue, Users icon)
- `M`: Material (yellow, Package icon)
- `E`: Equipment (green, Wrench icon)
- `S`: Subcontractor (gray, DollarSign icon)
- `O`: Other (light gray, Boxes icon)

---

#### ProgressBar

Progress bar for budget vs actual visualization.

**Accessibility:**

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Descriptive `aria-label` with progress type and percentage
- Hidden text provides detailed information

```tsx
import { ProgressBar } from "@/components/shared/ProgressBar";

<ProgressBar value={75} max={100} showLabel />
<ProgressBar value={50} variant="success" showLabel />
<ProgressBar value={85} variant="warning" showLabel />
<ProgressBar value={110} variant="danger" showLabel />
// Screen reader: "Success progress: 75% complete, 75 of 100"
```

**Props:**

- `value`: Current value
- `max`: Maximum value (default: 100)
- `showLabel`: Show value labels (default: false)
- `variant`: "default" | "success" | "warning" | "danger"

---

#### ProjectCard

Card displaying project summary information.

**Accessibility:**

- `role="button"` when clickable, `role="article"` otherwise
- Comprehensive `aria-label` with all project details
- Keyboard navigation (Enter/Space to activate)
- Visible focus ring on keyboard navigation
- Semantic `<time>` elements with `dateTime` attributes

```tsx
import { ProjectCard } from "@/components/shared/ProjectCard";

<ProjectCard project={project} onClick={handleClick} />;
// Screen reader: "Project: Citizens Medical Center, Job number 23CON0002, Status: Active"
// Keyboard: Enter or Space to open
```

---

### Data Components

#### DataTable

Sortable, accessible data table.

**Accessibility:**

- `role="table"` with proper table semantics
- Sortable columns have `role="button"` and `aria-sort`
- `aria-label` on headers describes sort state
- Row count announced via `sr-only` live region
- Keyboard navigation for sorting (Enter/Space)
- Clickable rows have `role="button"` and keyboard support
- Focus indicators on interactive elements

**Keyboard Navigation:**

- Tab: Navigate between sortable columns
- Enter/Space on header: Sort column
- Enter/Space on row: Activate row action

```tsx
import { DataTable } from "@/components/shared/DataTable";

<DataTable
  data={projects}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={handleRowClick}
  sortBy="name"
  sortOrder="asc"
  onSort={handleSort}
/>;
// Screen reader: "Data table, Contract Amount, sortable column, currently sorted ascending"
// Keyboard: Tab to column header, Enter to sort
```

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
- **ProjectCard**: For project list and selection screens
- **DataTable**: For tabular data with sorting
- **CostCodeSelect**: For cost code selection in forms

### Styling

All components support the `className` prop for custom styling:

```tsx
<CurrencyInput className="w-full" />
<MetricCard className="border-primary-500" />
```

### Accessibility Best Practices

#### Always Provide Labels

```tsx
// ❌ Bad - No label
<Input type="text" />

// ✅ Good - Visible label
<label htmlFor="project-name">Project Name</label>
<Input id="project-name" type="text" />

// ✅ Good - Hidden label for screen readers
<label htmlFor="search" className="sr-only">Search projects</label>
<Input id="search" type="text" placeholder="Search..." />
```

#### Link Errors to Inputs

```tsx
// ✅ Good - Error linked via aria-describedby
<Input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>;
{
  hasError && (
    <p id="email-error" role="alert" className="text-error">
      Please enter a valid email address
    </p>
  );
}
```

#### Announce Dynamic Changes

```tsx
// ✅ Good - Changes announced to screen readers
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? "Loading..." : `${projects.length} projects found`}
</div>
```

#### Support Keyboard Navigation

```tsx
// ✅ Good - Keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

---

## Testing

### Automated Tests

```bash
# Run accessibility tests
npm run test:a11y

# Run all tests
npm test
```

### Manual Testing Checklist

- [ ] Navigate entire component using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast meets WCAG AA (4.5:1)
- [ ] Test at 200% browser zoom
- [ ] Check focus indicators are visible
- [ ] Verify error messages are announced
- [ ] Test with reduced motion enabled

### Example Test

```tsx
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";

test("renders metric card with value", () => {
  render(<MetricCard title="Total" value="$15.2M" />);
  expect(screen.getByText("Total")).toBeInTheDocument();
  expect(screen.getByText("$15.2M")).toBeInTheDocument();
});

test("metric card is accessible", async () => {
  const { container } = render(
    <MetricCard title="Total" value="$15.2M" trend="up" trendValue="+5%" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Resources

- [ACCESSIBILITY.md](../../ACCESSIBILITY.md) - Complete accessibility guide
- [testing-guidelines.md](../../../.kiro/steering/testing-guidelines.md) - Testing patterns
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## Contributing

When adding new components:

1. Include proper ARIA labels and roles
2. Support keyboard navigation
3. Ensure color contrast meets WCAG AA
4. Add screen reader text where needed
5. Test with keyboard and screen reader
6. Document accessibility features
7. Add automated accessibility tests

See [ACCESSIBILITY.md](../../ACCESSIBILITY.md) for detailed guidelines.
