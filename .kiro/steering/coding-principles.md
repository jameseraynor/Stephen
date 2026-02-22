---
inclusion: always
---

# Coding Principles

All generated code must follow these principles. No exceptions.

## Core Principles

1. **DRY** — Never repeat logic. If 2+ handlers share a pattern, extract it to `shared/`.
2. **KISS** — Prefer the simplest solution. No abstractions until needed twice.
3. **YAGNI** — Don't build features, utilities, or abstractions "just in case."
4. **SRP** — Each function/module does one thing. Handlers route, helpers help.
5. **Fail Fast** — Validate inputs at the top of every handler. Reject bad data immediately with clear error messages. Never let invalid data reach the database or business logic.
6. **Defensive Programming** — Never trust external data (body, query params, path params, headers). Always validate with Zod before using. Assume every input can be malformed, missing, or malicious.
7. **Separation of Concerns** — Handlers only route requests. Business logic goes in dedicated functions. SQL goes in query helpers. Don't mix validation + logic + response formatting in one function.
8. **Least Privilege** — Each Lambda only gets the IAM permissions it needs. Each endpoint validates the minimum required role. Never grant broad access "for convenience."
9. **Convention over Configuration** — Use consistent patterns everywhere: same file structure, same column naming (snake_case), same response format, same error codes. A new dev should understand the codebase by reading one handler.
10. **Error Boundaries** — Distinguish controlled errors (ApiError with code + status) from unexpected errors. Never expose stack traces, SQL errors, or internal details to the client. Log the full error server-side, return a clean message to the client.
11. **Immutability** — Don't mutate input objects (event, body, params). Create new objects for transformations. This prevents subtle bugs from shared references.
12. **Single Source of Truth** — Field maps (camelCase to snake_case) are defined once per domain. Zod schemas are the only source of validation rules. Don't duplicate validation logic between frontend and backend manually.

## Backend-Specific Rules

### Use shared utilities (don't reinvent)

| Need                                   | Use                                          | Don't                                     |
| -------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| Handler boilerplate (try/catch/logger) | `createHandler()` from `shared/router.ts`    | Manual try/catch/finally in every handler |
| Dynamic UPDATE SET clause              | `buildUpdate()` from `shared/sql-builder.ts` | Manual `if (field !== undefined)` chains  |
| Parse request body                     | `parseBody()` from `shared/validation.ts`    | `JSON.parse(event.body \|\| '{}')` inline |
| camelCase to snake_case field mapping  | `fieldMap` object passed to `buildUpdate()`  | Manual mapping per handler                |

### Handler structure

```typescript
// GOOD — minimal, delegates to shared utilities
export const handler = createHandler(async (event) => {
  const method = event.httpMethod;
  switch (method) {
    case "GET":
      return list(event);
    case "POST":
      return create(event);
    default:
      throw new ApiError("VALIDATION_ERROR", "Method not allowed", 405);
  }
});

// BAD — repeated boilerplate
export async function handler(event) {
  const requestId = event.requestContext.requestId;
  try {
    logger.appendKeys({ requestId });
    // ... same switch ...
  } catch (error) {
    logger.error("Error", error);
    return errorResponse(error, requestId);
  } finally {
    logger.resetKeys();
  }
}
```

### UPDATE queries

```typescript
// GOOD — one-liner via shared utility
const { sql, params } = buildUpdate(
  "BUDGET_LINES",
  body,
  {
    costCodeId: "cost_code_id",
    description: "description",
    budgetedAmount: "budgeted_amount",
  },
  { id: lineId, project_id: projectId },
);

// BAD — manual if-chain per field
const setClauses = [];
const params = [];
let idx = 1;
if (body.costCodeId !== undefined) {
  setClauses.push(`cost_code_id = $${idx++}`);
  params.push(body.costCodeId);
}
// ... repeated for every field ...
```

### Fail Fast

```typescript
// GOOD — validate immediately, fail before any DB call
async function updateBudgetLine(event, projectId, lineId) {
  const user = getUserFromEvent(event); // Fails if no auth
  requireRole(user, "ProjectManager"); // Fails if wrong role
  validatePathParam("lineId", lineId, uuid); // Fails if bad UUID
  const body = validateBody(Schema, parseBody(event.body)); // Fails if bad data
  // Only now do we touch the database
}

// BAD — validates late, wastes a DB call
async function updateBudgetLine(event, projectId, lineId) {
  const result = await query("SELECT ...", [lineId]); // DB call before validation
  const body = JSON.parse(event.body); // No validation at all
}
```

### Error Boundaries

```typescript
// GOOD — controlled error with clean client message
throw new ApiError("NOT_FOUND", "Budget line not found", 404);

// GOOD — unexpected error logged server-side, generic message to client
catch (error) {
  logger.error("Unexpected error", error);
  return errorResponse(error, requestId);
  // Client sees: { error: { code: "INTERNAL_ERROR", message: "..." } }
}

// BAD — leaking internals to client
catch (error) {
  return { statusCode: 500, body: JSON.stringify({ error: error.stack }) };
}
```

### Defensive Programming

```typescript
// GOOD — Zod validates everything before use
const body = validateBody(CreateProjectSchema, parseBody(event.body));
// body.contractAmount is guaranteed to be a positive number

// BAD — trusting raw input
const body = JSON.parse(event.body);
const amount = body.contractAmount; // Could be string, null, negative, missing
await query("INSERT ... VALUES ($1)", [amount]);
```

### Imports

Keep imports minimal. If every handler imports the same 8 modules, that's a sign the router wrapper should handle the common ones internally.

## Frontend Principles

### 1. Composition over Inheritance

Build UI by combining small components, not extending base ones. Use children, render props, and hooks.

```typescript
// GOOD — composable
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body><BudgetTable data={lines} /></Card.Body>
</Card>

// BAD — monolithic prop-driven component
<Card title="Title" bodyType="budget-table" data={lines} showHeader={true} />
```

### 2. Colocation

Related files live together. Tests, types, and styles go next to the component.

```
components/shared/
  ProjectCard.tsx
  ProjectCard.test.tsx
```

Not in separate folders by type (`tests/ProjectCard.test.tsx`, `types/ProjectCard.ts`).

### 3. Unidirectional Data Flow

Data flows down via props. Events flow up via callbacks. Never mutate parent state from a child.

```typescript
// GOOD — parent owns state, child reports events
function BudgetPage() {
  const [lines, setLines] = useState<BudgetLine[]>([]);
  return <BudgetTable lines={lines} onDelete={(id) => setLines(prev => prev.filter(l => l.id !== id))} />;
}

// BAD — child reaches into parent state
function BudgetRow({ parentSetLines }) {
  parentSetLines(prev => ...); // Don't do this
}
```

### 4. Optimistic UI

For common operations (save, update, delete), update the UI immediately and revert on failure. The user shouldn't wait for the server.

```typescript
// GOOD — instant feedback
async function handleDelete(id: string) {
  const backup = lines;
  setLines((prev) => prev.filter((l) => l.id !== id)); // Instant
  try {
    await api.delete(id);
  } catch {
    setLines(backup); // Revert on failure
    toast.error("Failed to delete");
  }
}

// BAD — user waits for server
async function handleDelete(id: string) {
  setLoading(true);
  await api.delete(id); // User stares at spinner
  await refetchAll(); // Another wait
  setLoading(false);
}
```

### 5. Error Recovery

Every component that fetches data must show an error state with a retry option. Never leave the user stuck.

```typescript
// GOOD
if (error) return <ErrorState message={error.message} onRetry={refetch} />;

// BAD
if (error) return <p>Something went wrong</p>;  // No way out
```

### 6. Loading States

Use skeleton loaders that match the layout of the content, not generic spinners.

```typescript
// GOOD — skeleton matches the real layout
if (loading) return <ProjectCardSkeleton />;

// BAD — generic spinner tells the user nothing
if (loading) return <Spinner />;
```

### 7. Accessible by Default

Every input needs a label. Use semantic HTML. Support keyboard navigation. Ensure sufficient contrast.

```typescript
// GOOD
<Label htmlFor="amount">Contract Amount</Label>
<Input id="amount" type="number" aria-describedby="amount-help" />
<p id="amount-help">Enter the total contract value</p>

// BAD
<input placeholder="Amount" />  // No label, no description
```

### 8. Responsive First

Design mobile-first with Tailwind. Even though MVP targets desktop, structure must support responsive without rewriting.

```typescript
// GOOD — mobile-first, scales up
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// BAD — desktop-only, breaks on mobile
<div className="grid grid-cols-3 gap-4">
```

### 9. State Colocation

State lives as close as possible to where it's used. Local state > context > global store. Don't put everything in a global store (YAGNI).

```typescript
// GOOD — local state for local concerns
function BudgetForm() {
  const [amount, setAmount] = useState(0); // Only this component needs it
}

// BAD — global store for a single form field
const useBudgetStore = create((set) => ({
  amount: 0,
  setAmount: (v) => set({ amount: v }),
}));
```

### 10. Derived State

If a value can be calculated from existing state, compute it with useMemo. Don't store it as separate state — that causes sync bugs.

```typescript
// GOOD — derived from source of truth
const totalBudget = useMemo(
  () => lines.reduce((sum, l) => sum + l.budgetedAmount, 0),
  [lines],
);

// BAD — separate state that can go out of sync
const [lines, setLines] = useState([]);
const [totalBudget, setTotalBudget] = useState(0);
// Now you must remember to update totalBudget every time lines changes
```

### General Rules

- Extract repeated UI patterns into shared components
- Use custom hooks for repeated data-fetching logic
- Don't create wrapper components that just pass props through
- Validate form data with Zod schemas before submitting to the API
- Handle loading, error, and empty states in every data-fetching component
- Never use `any` — use explicit types for all props, state, and API responses
