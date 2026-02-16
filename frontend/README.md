# Cost Control System - Frontend

React 19.2 + TypeScript 5.7 + Vite 6 + Tailwind CSS 4 frontend application.

## Status: ✅ Component Library Complete

The frontend component library is fully implemented and ready for feature development.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server will start at http://localhost:5173 (or next available port).

---

## What's Included

### Base UI Components (9)

- Button, Card, Input, Label, Select, Dialog, Table, Tabs, Toast

### Custom Shared Components (8)

- CurrencyInput, HoursInput, PercentageInput
- MetricCard, StatusBadge, VarianceIndicator
- CostTypeIcon, ProgressBar

### Design System

- Tailwind CSS 4 with custom theme
- Color palette (Primary, Success, Warning, Danger, Neutral)
- Typography system (Inter font)
- Spacing, shadows, and border radius

### Component Showcase

- Interactive demo of all components
- Real-world usage examples
- Live at http://localhost:5173 when dev server is running

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components (9)
│   │   └── shared/          # Custom domain components (8)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (cn function)
│   ├── types/               # TypeScript type definitions
│   ├── index.css            # Tailwind CSS 4 theme
│   ├── App.tsx              # Main app component
│   ├── ComponentShowcase.tsx # Component showcase
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── components.json          # shadcn/ui configuration
├── package.json
├── vite.config.ts
├── tsconfig.json
├── COMPONENT_LIBRARY_SUMMARY.md
├── UPGRADE_INSTRUCTIONS.md
└── README.md (this file)
```

---

## Available Scripts

### Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Testing

```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # Run tests in CI mode
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # Run TypeScript type checking
```

---

## Component Usage

### CurrencyInput

```tsx
import { CurrencyInput } from "@/components/shared/CurrencyInput";

const [amount, setAmount] = useState<number | null>(15190206);

<CurrencyInput
  value={amount ?? undefined}
  onChange={setAmount}
  placeholder="0.00"
/>;
```

### HoursInput

```tsx
import { HoursInput } from "@/components/shared/HoursInput";

const [hours, setHours] = useState<number | null>(8);

<HoursInput value={hours ?? undefined} onChange={setHours} max={24} />;
```

### MetricCard

```tsx
import { MetricCard } from "@/components/shared/MetricCard";
import { DollarSign } from "lucide-react";

<MetricCard
  title="Total Contract Value"
  value="$15.2M"
  trend="up"
  trendValue="+2.3%"
  icon={<DollarSign className="h-4 w-4" />}
/>;
```

### StatusBadge

```tsx
import { StatusBadge } from "@/components/shared/StatusBadge";

<StatusBadge status="active" />
<StatusBadge status="completed" />
<StatusBadge status="on-hold" />
<StatusBadge status="cancelled" />
```

See `src/components/shared/EXAMPLES.tsx` for more usage examples.

---

## Documentation

- **Component Library Summary**: `COMPONENT_LIBRARY_SUMMARY.md`
- **Setup Instructions**: `UPGRADE_INSTRUCTIONS.md`
- **Shared Components API**: `src/components/shared/README.md`
- **Usage Examples**: `src/components/shared/EXAMPLES.tsx`
- **Design System**: `../docs/Design_System.md`
- **React Conventions**: `../.kiro/steering/react-typescript-conventions.md`
- **Testing Guidelines**: `../.kiro/steering/testing-guidelines.md`

---

## Tech Stack

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| React        | 19.2.4  | UI framework          |
| TypeScript   | 5.7     | Type safety           |
| Vite         | 6.0.7   | Build tool            |
| Tailwind CSS | 4.0.0   | Styling               |
| Vitest       | 3.0.5   | Testing               |
| React Router | 7.1.1   | Routing               |
| AWS Amplify  | 6.11.3  | AWS integration       |
| Radix UI     | Latest  | Accessible primitives |
| Lucide React | 0.468.0 | Icons                 |
| Zod          | 3.24.1  | Validation            |

---

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# AWS Cognito
VITE_USER_POOL_ID=your_user_pool_id
VITE_USER_POOL_CLIENT_ID=your_client_id
VITE_IDENTITY_POOL_ID=your_identity_pool_id

# API
VITE_API_ENDPOINT=your_api_endpoint
VITE_AWS_REGION=us-east-1
```

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

Target: Modern browsers with ES2020+ support

---

## Performance

- Tree-shaking enabled
- Code splitting for routes
- Optimized bundle size
- CSS purging in production
- Source maps in development

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast (4.5:1 minimum)
- ARIA labels

---

## Next Steps

### Immediate

1. Create layout components (Header, Sidebar, MainLayout)
2. Create feature components (ProjectCard, BudgetLineRow, etc.)
3. Set up routing with React Router

### Short Term

1. Configure AWS Amplify
2. Create API client base
3. Create custom hooks (useProjects, useBudget, etc.)
4. Build authentication flow

### Medium Term

1. Add unit tests for all components
2. Add integration tests
3. Set up Storybook
4. Optimize bundle size

---

## Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite automatically tries the next available port.

### Module Not Found

Ensure path aliases are configured in `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Classes Not Working

Ensure `index.css` is imported in `main.tsx`:

```tsx
import "./index.css";
```

---

## Contributing

Follow the conventions in:

- `.kiro/steering/react-typescript-conventions.md`
- `.kiro/steering/testing-guidelines.md`

---

## License

Proprietary - All rights reserved

---

## Support

For questions or issues, contact the project owner.

---

**Last Updated**: February 16, 2026  
**Status**: ✅ Ready for Feature Development
