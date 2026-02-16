# Design System - Project Cost Control

## Component Library

**Selection: shadcn/ui**

Reasons:
- Components copied to the project (no external dependency)
- Built on Radix UI (accessibility included)
- Native integration with TailwindCSS
- 100% customizable
- Very popular in the React/TypeScript ecosystem

---

## Design Tokens

### Color Palette

```javascript
// tailwind.config.js
colors: {
  // Primary - Professional blue (trust, stability)
  primary: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary - Slate (UI neutrals)
  secondary: {
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Semantic states
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  
  // Domain-specific
  costType: {
    labor: '#3b82f6',      // L - Blue
    materials: '#22c55e',  // M - Green
    equipment: '#f59e0b',  // E - Yellow
    subcontract: '#8b5cf6',// S - Purple
    other: '#64748b',      // O - Gray
    pm: '#ec4899',         // F - Pink
  }
}
```

### Typography

```javascript
// tailwind.config.js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],  // For numbers/code
}

fontSize: {
  xs:   ['0.75rem', { lineHeight: '1rem' }],
  sm:   ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg:   ['1.125rem', { lineHeight: '1.75rem' }],
  xl:   ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
}
```

### Spacing

Use Tailwind's default scale (4px base):
- `space-1` = 4px
- `space-2` = 8px
- `space-4` = 16px
- `space-6` = 24px
- `space-8` = 32px

### Borders and Shadows

```javascript
borderRadius: {
  none: '0',
  sm: '0.25rem',   // 4px - inputs, badges
  DEFAULT: '0.5rem', // 8px - cards, buttons
  lg: '0.75rem',   // 12px - modals
  full: '9999px',  // pills, avatars
}

boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}
```

---

## Required Components (shadcn/ui)

### Essential for MVP

| Component | App Usage |
|-----------|-----------|
| Button | Primary and secondary actions |
| Input | Numeric and text data entry |
| Select | Dropdowns (cost codes, months, projects) |
| Table | Budget, actuals, projections listings |
| Card | Metric containers in dashboard |
| Dialog/Modal | Confirmations, edit forms |
| Form | Form validation |
| Label | Field labels |
| Badge | States, cost types |
| Tabs | Secondary navigation |
| Toast | Success/error notifications |
| Skeleton | Loading states |
| Dropdown Menu | User menu, actions |

### Custom Components to Create

| Component | Description |
|-----------|-------------|
| CurrencyInput | Formatted input for currency ($1,234.56) |
| HoursInput | Input for hours with validation |
| CostCodeSelect | Select with cost code search |
| MetricCard | Card for dashboard KPIs |
| VarianceIndicator | Shows variance with color (+ green, - red) |
| ProgressBar | Progress bar for budget vs actual |

---

## UI Patterns

### Main Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header (h-16, fixed)                                       │
│  Logo | Nav Tabs | Project Selector | User Menu             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Main Content (pt-16, min-h-screen)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Page Header                                         │   │
│  │  Title | Actions                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                      │   │
│  │  Content Area                                        │   │
│  │  max-w-7xl mx-auto px-4                              │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Forms

- Labels above the input
- Error messages below the input in red
- Required fields with asterisk (*)
- Primary button on the right, cancel on the left

### Data Tables

- Sticky header
- Alternating rows (zebra striping)
- Hover state on rows
- Numbers aligned to the right
- Actions in the last column

### Number Formatting

```typescript
// Currency
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Percentage
const formatPercent = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);

// Hours
const formatHours = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
```

---

## Component States

### Buttons

| Variant | Usage |
|---------|-------|
| Primary | Main action (Save, Create) |
| Secondary | Secondary action (Cancel) |
| Destructive | Delete, dangerous actions |
| Ghost | Tertiary actions, icons |
| Link | Inline navigation |

### Inputs

| State | Style |
|-------|-------|
| Default | border-secondary-300 |
| Focus | ring-2 ring-primary-500 |
| Error | border-error ring-error |
| Disabled | bg-secondary-100 cursor-not-allowed |

---

## Responsive Breakpoints

```javascript
screens: {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
}
```

**Priority:** Desktop-first (office users), but functional on tablet.

---

## Accessibility

- All inputs with associated labels
- Minimum contrast 4.5:1 for text
- Visible focus on all interactive elements
- Keyboard navigation support
- aria-labels on icons without text

---

## Next Steps

1. [ ] Initialize React + Vite + TypeScript project
2. [ ] Configure TailwindCSS with defined tokens
3. [ ] Install shadcn/ui and essential components
4. [ ] Create domain-specific components
5. [ ] Document usage with examples
