---
inclusion: auto
---

# Frontend Architecture Conventions

This document defines how to build screens, organize pages, handle navigation, manage state, and connect to the backend API in this application. It complements `react-typescript-conventions.md` (code style) and `docs/Design_System.md` (visual design).

## Target Environment

- Desktop only: 1920×1080 minimum resolution
- No tablet or mobile responsive design (future phase)
- Modern browsers: Chrome, Edge, Firefox (latest 2 versions)

## Application Shell

The app has a fixed layout with a top header and tabbed navigation. No sidebar.

```
┌─────────────────────────────────────────────────────────────────┐
│  Header (h-16, fixed top, z-50, bg-white border-b)             │
│  [Logo]  [Nav Tabs]                    [Project Selector] [👤] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  <main> (pt-16, min-h-screen, bg-secondary-50)                  │
│    <div> (max-w-7xl mx-auto px-6 py-6)                          │
│      ┌──────────────────────────────────────────────────────┐   │
│      │  PageHeader: title + action buttons                   │   │
│      ├──────────────────────────────────────────────────────┤   │
│      │                                                       │   │
│      │  Page Content                                         │   │
│      │                                                       │   │
│      └──────────────────────────────────────────────────────┘   │
│    </div>                                                        │
│  </main>                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Components

```
src/components/layout/
├── AppLayout.tsx          # Shell with Header + <Outlet />
├── Header.tsx             # Top bar: logo, nav tabs, project selector, user menu
├── PageHeader.tsx         # Reusable: page title + optional action buttons
├── ProtectedRoute.tsx     # Auth guard: redirects to /login if not authenticated
└── RoleGuard.tsx          # Role guard: shows forbidden message if insufficient role
```

### AppLayout Structure

```typescript
// components/layout/AppLayout.tsx
export function AppLayout() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

## Routing Structure

```typescript
// App.tsx — Route definitions
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/callback" element={<AuthCallbackPage />} />

  {/* Protected — requires authentication */}
  <Route element={<ProtectedRoute />}>

    {/* Project selection (no project context needed) */}
    <Route path="/" element={<ProjectSelectionPage />} />

    {/* Project-scoped routes (require selected project) */}
    <Route path="/projects/:projectId" element={<AppLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="budget" element={<BudgetPage />} />
      <Route path="employees" element={<EmployeesPage />} />
      <Route path="time-entry" element={<TimeEntryPage />} />
      <Route path="actuals" element={<ActualsPage />} />
      <Route path="projections" element={<ProjectionsPage />} />
      <Route path="reports" element={<ReportsPage />} />
    </Route>

    {/* Admin routes */}
    <Route path="/admin" element={<AppLayout />}>
      <Route path="users" element={<RoleGuard role="Admin"><UsersPage /></RoleGuard>} />
      <Route path="cost-codes" element={<RoleGuard role="Admin"><CostCodesPage /></RoleGuard>} />
      <Route path="labor-rates" element={<RoleGuard role="Admin"><LaborRatesPage /></RoleGuard>} />
      <Route path="equipment" element={<RoleGuard role="Admin"><EquipmentPage /></RoleGuard>} />
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### Navigation Tabs (in Header)

When a project is selected, the header shows these tabs:

```
Dashboard | Budget | Employees | Time Entry | Actuals | Projections | Reports
```

Admin users also see a "Setup" dropdown menu with: Users, Cost Codes, Labor Rates, Equipment.

## Page Structure

Every page follows the same pattern:

```
src/pages/
├── LoginPage.tsx
├── AuthCallbackPage.tsx
├── ProjectSelectionPage.tsx
├── DashboardPage.tsx
├── BudgetPage.tsx
├── EmployeesPage.tsx
├── TimeEntryPage.tsx
├── ActualsPage.tsx
├── ProjectionsPage.tsx
├── ReportsPage.tsx
├── admin/
│   ├── UsersPage.tsx
│   ├── CostCodesPage.tsx
│   ├── LaborRatesPage.tsx
│   └── EquipmentPage.tsx
└── NotFoundPage.tsx
```

### Page Component Pattern

Every page component follows this structure:

```typescript
// pages/BudgetPage.tsx
import { PageHeader } from '@/components/layout/PageHeader';
import { BudgetTable } from '@/components/features/budget/BudgetTable';
import { BudgetActions } from '@/components/features/budget/BudgetActions';
import { useBudgetLines } from '@/hooks/useBudgetLines';
import { useProjectContext } from '@/hooks/useProjectContext';

export function BudgetPage() {
  const { projectId } = useProjectContext();
  const { budgetLines, loading, error, refetch } = useBudgetLines(projectId);

  return (
    <>
      <PageHeader
        title="Budget"
        actions={<BudgetActions onAdd={handleAdd} />}
      />

      {loading && <TableSkeleton />}
      {error && <ErrorAlert error={error} onRetry={refetch} />}
      {!loading && !error && (
        <BudgetTable lines={budgetLines} onEdit={handleEdit} />
      )}
    </>
  );
}
```

### Page Rules

1. Pages are thin orchestrators — they wire hooks to components
2. Pages use `PageHeader` for consistent title + actions layout
3. Pages handle the 3 states: loading, error, and data
4. Pages do NOT contain business logic or direct API calls
5. Pages import feature components from `components/features/{domain}/`

## Component Organization by Feature

Each domain has its own folder under `components/features/`:

```
src/components/features/
├── projects/
│   ├── ProjectCard.tsx
│   ├── ProjectList.tsx
│   └── ProjectForm.tsx
├── budget/
│   ├── BudgetTable.tsx
│   ├── BudgetLineForm.tsx
│   ├── BudgetSummary.tsx
│   └── BudgetActions.tsx
├── employees/
│   ├── EmployeeTable.tsx
│   ├── EmployeeForm.tsx
│   └── EmployeeActions.tsx
├── time-entry/
│   ├── TimeEntryGrid.tsx
│   ├── TimeEntryRow.tsx
│   └── TimeEntryActions.tsx
├── actuals/
│   ├── ActualsTable.tsx
│   ├── ActualsForm.tsx
│   └── ActualsSummary.tsx
├── projections/
│   ├── ProjectionTable.tsx
│   ├── ProjectionForm.tsx
│   ├── ProjectionSnapshot.tsx
│   └── ProjectionComparison.tsx
├── reports/
│   ├── ExecutiveSummary.tsx
│   ├── VarianceReport.tsx
│   └── ExportButton.tsx
└── dashboard/
    ├── MetricCard.tsx
    ├── CostBreakdownChart.tsx
    ├── GpSummary.tsx
    └── HoursSummary.tsx
```

### Component Rules

1. Feature components receive data via props — they do NOT call hooks directly
2. Feature components are pure presentation + interaction (click handlers, form state)
3. Shared/reusable components go in `components/shared/`
4. shadcn/ui base components stay in `components/ui/` untouched

## Data Flow: Hooks → Pages → Components

```
API Service (services/)
  ↕ HTTP calls
Custom Hook (hooks/)
  ↕ state management
Page (pages/)
  ↕ props
Feature Component (components/features/)
  ↕ props
UI Component (components/ui/)
```

### API Services

One service file per domain. Services handle HTTP only — no state, no caching.

```
src/services/
├── api.ts              # Base API client configuration (Amplify)
├── projects.api.ts
├── budget.api.ts
├── employees.api.ts
├── timeEntries.api.ts
├── actuals.api.ts
├── projections.api.ts
├── costCodes.api.ts
├── laborRates.api.ts
└── auth.api.ts
```

```typescript
// services/projects.api.ts
import { apiClient } from "./api";

export const projectsApi = {
  list: (params?: { status?: string; search?: string }) =>
    apiClient.get<Project[]>("/projects", { params }),

  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectInput) =>
    apiClient.post<Project>("/projects", data),

  update: (id: string, data: UpdateProjectInput) =>
    apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => apiClient.del(`/projects/${id}`),
};
```

### Custom Hooks

One hook per data concern. Hooks manage loading/error/data state.

```
src/hooks/
├── useAuth.ts              # Authentication state & methods
├── useProjectContext.ts    # Current selected project
├── useProjects.ts          # Project list
├── useProject.ts           # Single project
├── useBudgetLines.ts       # Budget lines for a project
├── useEmployees.ts         # Employees for a project
├── useTimeEntries.ts       # Time entries for a project
├── useCostCodes.ts         # Cost codes (reference data)
├── useLaborRates.ts        # Labor rates (reference data)
├── useActuals.ts           # Actuals for a project
├── useProjections.ts       # Projections for a project
└── usePermissions.ts       # Role-based permission checks
```

### Hook Pattern

```typescript
// hooks/useBudgetLines.ts
export function useBudgetLines(projectId: string) {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetApi.list(projectId);
      setBudgetLines(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (data: CreateBudgetLineInput) => {
    const created = await budgetApi.create(projectId, data);
    setBudgetLines((prev) => [...prev, created.data]);
    return created.data;
  };

  const update = async (lineId: string, data: UpdateBudgetLineInput) => {
    const updated = await budgetApi.update(projectId, lineId, data);
    setBudgetLines((prev) =>
      prev.map((l) => (l.id === lineId ? updated.data : l)),
    );
    return updated.data;
  };

  const remove = async (lineId: string) => {
    await budgetApi.delete(projectId, lineId);
    setBudgetLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  return {
    budgetLines,
    loading,
    error,
    refetch: fetch,
    create,
    update,
    remove,
  };
}
```

### Hook Rules

1. Every hook returns `{ data, loading, error, refetch }` at minimum
2. Mutation hooks (create/update/delete) update local state optimistically or after success
3. Hooks call API services — never raw fetch/axios
4. Hooks do NOT handle HTTP status codes — services throw, hooks catch

## Project Context

The selected project is stored in a React Context, accessible via `useProjectContext()`.

```typescript
// hooks/useProjectContext.ts
interface ProjectContextValue {
  projectId: string;
  project: Project | null;
  loading: boolean;
  setProjectId: (id: string) => void;
}
```

All project-scoped pages get `projectId` from this context (derived from URL param `:projectId`).

## Types

Frontend types mirror the API response shapes (camelCase). Defined in `src/types/`:

```
src/types/
├── project.ts        # Project, CreateProjectInput, UpdateProjectInput
├── budget.ts         # BudgetLine, CreateBudgetLineInput, etc.
├── employee.ts
├── timeEntry.ts
├── actual.ts
├── projection.ts
├── costCode.ts
├── laborRate.ts
├── auth.ts           # AuthUser, UserRole
└── api.ts            # ApiResponse<T>, ApiError, PaginatedResponse<T>
```

### API Response Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
    timestamp: string;
    requestId?: string;
  };
}
```

## State Management

- No Redux or Zustand for MVP
- React Context for global state: auth user, selected project
- Custom hooks with useState for page-level data
- Props for component-level state

### What Goes Where

| State                   | Where                             | Example                     |
| ----------------------- | --------------------------------- | --------------------------- |
| Auth user & tokens      | AuthContext                       | `useAuth()`                 |
| Selected project        | ProjectContext (from URL)         | `useProjectContext()`       |
| Page data               | Custom hook per page              | `useBudgetLines(projectId)` |
| Form state              | Local useState or React Hook Form | `useForm()`                 |
| UI state (modals, tabs) | Local useState in page/component  | `useState(false)`           |
| Toast notifications     | Toast context (shadcn/ui)         | `useToast()`                |

## Number Formatting

All financial numbers use consistent formatting. Use utility functions from `lib/formatters.ts`:

```typescript
// lib/formatters.ts
export function formatCurrency(value: number): string { ... }    // $1,234,567
export function formatCurrencyDetailed(value: number): string { ... } // $1,234,567.89
export function formatPercent(value: number): string { ... }     // 31.5%
export function formatHours(value: number): string { ... }       // 1,234.5
export function formatNumber(value: number): string { ... }      // 1,234
```

### Formatting Rules

- Currency in tables: no decimals (`$1,234,567`) unless the column is for unit rates
- Currency in detail views: 2 decimals (`$1,234,567.89`)
- Percentages: 1 decimal (`31.5%`)
- Hours: 1 decimal (`1,234.5`)
- Numbers aligned right in tables, text aligned left
- Negative values in red with parentheses: `($1,234)`
- Use `font-mono` (JetBrains Mono) for all numeric columns in tables

## Permission Checks in UI

Use the `usePermissions` hook to show/hide UI elements based on role:

```typescript
const { canEdit, canDelete, canCreate, isAdmin } = usePermissions();

// Hide buttons the user can't use
{canCreate && <Button onClick={handleAdd}>Add Budget Line</Button>}
{canEdit && <Button onClick={handleEdit}>Edit</Button>}
{isAdmin && <DropdownMenu>...</DropdownMenu>}
```

### Permission Rules

- Never rely on UI hiding alone for security — backend enforces authorization
- Hide actions the user cannot perform (don't show disabled buttons)
- Show read-only views for Viewers (no edit/delete buttons, no form inputs)

## Loading & Error States

Every page must handle 3 states:

```typescript
// Standard pattern for all pages
{loading && <TableSkeleton rows={5} />}
{error && <ErrorAlert message={getUserMessage(error)} onRetry={refetch} />}
{!loading && !error && data.length === 0 && <EmptyState message="No budget lines yet" />}
{!loading && !error && data.length > 0 && <DataTable data={data} />}
```

### Shared State Components

```
src/components/shared/
├── TableSkeleton.tsx      # Skeleton loader for tables
├── CardSkeleton.tsx       # Skeleton loader for cards
├── ErrorAlert.tsx         # Error message with retry button
├── EmptyState.tsx         # Empty state with icon and message
├── LoadingSpinner.tsx     # Full-page spinner
├── ConfirmDialog.tsx      # Confirmation modal for destructive actions
└── CurrencyInput.tsx      # Formatted currency input
```

## Toast Notifications

Use shadcn/ui toast for user feedback after mutations:

```typescript
const { toast } = useToast();

// After successful create
toast({ title: "Budget line created", variant: "default" });

// After error — always use getUserMessage(), never raw error.message
toast({
  title: "Failed to save",
  description: getUserMessage(error),
  variant: "destructive",
});

// After delete
toast({ title: "Budget line deleted", variant: "default" });
```

## Error Handling

### Security Principle: Never Expose Internal Details

The user must never see stack traces, SQL errors, internal IDs, server paths, or raw API error messages. All errors shown to the user must be sanitized through a mapping layer.

### API Error Class

The API client wraps all HTTP errors into a typed `ApiClientError`:

```typescript
// lib/api-client.ts
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, string>,
    public requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Parse error from API response body
function parseApiError(status: number, body: unknown): ApiClientError {
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as ApiErrorResponse).error;
    return new ApiClientError(
      err.code,
      err.message,
      status,
      err.details,
      err.requestId,
    );
  }
  return new ApiClientError(
    "UNKNOWN_ERROR",
    "An unexpected error occurred",
    status,
  );
}
```

### User-Friendly Error Messages

Map API error codes to messages the user can understand. Never show raw backend messages directly.

```typescript
// lib/error-messages.ts
const ERROR_MESSAGES: Record<string, string> = {
  // Client errors
  VALIDATION_ERROR: "Please check the form for errors.",
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  DUPLICATE_RESOURCE: "A record with this information already exists.",
  INVALID_STATE: "This action cannot be performed in the current state.",

  // Server errors
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  DATABASE_ERROR: "Something went wrong. Please try again later.",
  EXTERNAL_SERVICE_ERROR:
    "A service is temporarily unavailable. Please try again.",

  // Network errors
  NETWORK_ERROR:
    "Unable to connect to the server. Check your internet connection.",
  TIMEOUT_ERROR: "The request took too long. Please try again.",
};

export function getUserMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return ERROR_MESSAGES[error.code] || ERROR_MESSAGES.INTERNAL_ERROR;
  }
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  return ERROR_MESSAGES.INTERNAL_ERROR;
}

export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (
    error instanceof ApiClientError &&
    error.code === "VALIDATION_ERROR" &&
    error.details
  ) {
    return error.details;
  }
  return null;
}
```

### Rules

- `getUserMessage()` is the ONLY function that produces user-facing error text
- Never use `error.message` directly in UI — always pass through `getUserMessage()`
- `getFieldErrors()` extracts per-field validation errors for form display
- The `ERROR_MESSAGES` map is the single source of truth for all user-facing error strings
- Server errors (500, 502, 503) always show the same generic message — never leak internals
- Log the full error to console in development only (`import.meta.env.DEV`)

### Error Handling by Layer

#### API Client Layer — catch HTTP errors, wrap in ApiClientError

```typescript
// lib/api-client.ts
async function request<T>(
  method: string,
  path: string,
  options?: RequestOptions,
): Promise<T> {
  try {
    const response = await amplifyApi[method](path, options);
    return response.data;
  } catch (error) {
    // Network error (no response)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiClientError("NETWORK_ERROR", "Network error", 0);
    }
    // API returned an error response
    if (error && typeof error === "object" && "response" in error) {
      const { status, body } = (error as any).response;
      throw parseApiError(status, body);
    }
    // Unknown error — wrap it
    throw new ApiClientError(
      "UNKNOWN_ERROR",
      "An unexpected error occurred",
      500,
    );
  }
}
```

#### Hook Layer — catch errors, store in state, handle 401 globally

```typescript
// hooks/useBudgetLines.ts
const fetch = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await budgetApi.list(projectId);
    setBudgetLines(response.data);
  } catch (err) {
    setError(err); // Store the ApiClientError (or whatever was thrown)
  } finally {
    setLoading(false);
  }
}, [projectId]);

const create = async (data: CreateBudgetLineInput) => {
  // Mutations throw — let the page/component catch and show toast
  const created = await budgetApi.create(projectId, data);
  setBudgetLines((prev) => [...prev, created.data]);
  return created.data;
};
```

#### Page Layer — show errors to user via ErrorAlert or toast

```typescript
// pages/BudgetPage.tsx
import { getUserMessage, getFieldErrors } from '@/lib/error-messages';

// For data loading errors — show ErrorAlert
{error && <ErrorAlert message={getUserMessage(error)} onRetry={refetch} />}

// For mutation errors — show toast
const handleCreate = async (data: CreateBudgetLineInput) => {
  try {
    await create(data);
    toast({ title: 'Budget line created' });
  } catch (err) {
    const fieldErrors = getFieldErrors(err);
    if (fieldErrors) {
      // Show field-level errors in the form
      setFormErrors(fieldErrors);
    } else {
      toast({ title: 'Error', description: getUserMessage(err), variant: 'destructive' });
    }
  }
};
```

### Authentication Errors (401) — Global Handler

401 errors are handled globally in the API client, not per-hook. When a 401 is received, redirect to login.

```typescript
// lib/api-client.ts — inside the request function
if (status === 401) {
  // Clear auth state and redirect to login
  await authService.signOut();
  window.location.href = "/login?expired=true";
  throw new ApiClientError("UNAUTHORIZED", "Session expired", 401);
}
```

### Rules

- 401 is always handled globally — individual hooks/pages never handle it
- After redirect to `/login?expired=true`, the login page shows "Your session has expired"
- Never store tokens in localStorage — use Amplify's secure storage
- On 403 (Forbidden), show an inline message — don't redirect

### Authorization Errors (403) — Inline Message

```typescript
// Show inline forbidden message, not a redirect
{error instanceof ApiClientError && error.statusCode === 403 && (
  <ErrorAlert
    message="You don't have permission to view this page."
    variant="warning"
  />
)}
```

### Form Validation Errors — Field-Level Display

When the backend returns `VALIDATION_ERROR` with `details`, map them to form fields:

```typescript
// In form component
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const handleSubmit = async (values: FormValues) => {
  try {
    setFieldErrors({});
    await onSave(values);
  } catch (err) {
    const serverErrors = getFieldErrors(err);
    if (serverErrors) {
      setFieldErrors(serverErrors);
    } else {
      throw err; // Re-throw for page-level handling
    }
  }
};

// In JSX — show error under each field
<Input name="jobNumber" error={fieldErrors.jobNumber} />
{fieldErrors.jobNumber && (
  <p className="text-sm text-destructive mt-1">{fieldErrors.jobNumber}</p>
)}
```

### Error Boundary — Catch Unexpected React Errors

Wrap the app in an Error Boundary to catch rendering crashes. This prevents a white screen.

```typescript
// components/shared/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev, send to monitoring in prod
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
    // Future: send to CloudWatch RUM or similar
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage in main.tsx
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

### What to Log vs What to Show

| Information              | Show to User   | Log to Console (dev) | Log to Monitoring (prod) |
| ------------------------ | -------------- | -------------------- | ------------------------ |
| User-friendly message    | ✅             | ✅                   | ❌                       |
| API error code           | ❌             | ✅                   | ✅                       |
| HTTP status code         | ❌             | ✅                   | ✅                       |
| Request ID               | ❌             | ✅                   | ✅                       |
| Stack trace              | ❌             | ✅                   | ✅                       |
| SQL error details        | ❌             | ❌                   | ❌ (backend only)        |
| Server file paths        | ❌             | ❌                   | ❌ (backend only)        |
| Raw error.message        | ❌             | ✅                   | ✅                       |
| Field validation details | ✅ (per field) | ✅                   | ❌                       |

### Error Handling Summary by HTTP Status

| Status | Error Code          | User Sees                                | Action                          |
| ------ | ------------------- | ---------------------------------------- | ------------------------------- |
| 400    | VALIDATION_ERROR    | Field-level errors on form               | Highlight fields, show messages |
| 401    | UNAUTHORIZED        | Redirect to login with "session expired" | Global handler, auto-redirect   |
| 403    | FORBIDDEN           | "You don't have permission" inline alert | Show warning, no redirect       |
| 404    | NOT_FOUND           | "Resource not found" inline alert        | Show error, offer navigation    |
| 409    | DUPLICATE_RESOURCE  | "A record already exists" toast          | Toast, keep form open           |
| 422    | INVALID_STATE       | "Action cannot be performed" toast       | Toast with explanation          |
| 500    | INTERNAL_ERROR      | "Something went wrong. Try again later." | Toast or ErrorAlert with retry  |
| 503    | SERVICE_UNAVAILABLE | "Service temporarily unavailable"        | ErrorAlert with retry           |
| 0      | NETWORK_ERROR       | "Check your internet connection"         | ErrorAlert with retry           |

## Common Pitfalls

❌ **Don't:**

- Call API services directly from components — use hooks
- Put business logic in components — keep them presentational
- Use `any` for API responses — type everything
- Show raw `error.message` from the API — always use `getUserMessage()`
- Show stack traces, SQL errors, or server paths to the user
- Forget loading/error/empty states on any page
- Use `index` as key in lists — use `id`
- Create pages that scroll horizontally — design for 1920px width
- Handle 401 in individual hooks — it's global
- Log sensitive data (tokens, passwords) to console even in dev

✅ **Do:**

- Follow Page → Hook → Service → API flow
- Use PageHeader on every page for consistent layout
- Use feature folders under `components/features/`
- Format all numbers with utility functions
- Hide UI actions based on user role
- Show skeleton loaders while data loads
- Use ConfirmDialog before destructive actions (delete)
- Pass all errors through `getUserMessage()` before showing to user
- Handle 401 globally in the API client with redirect to login
- Show field-level validation errors from backend on forms
- Wrap the app in ErrorBoundary to prevent white screens
- Log full error details to console in dev mode only
