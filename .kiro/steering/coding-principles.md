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

## Database Principles

### 1. Idempotent Migrations

Every migration must be safe to run multiple times. Use `IF NOT EXISTS` / `IF EXISTS`.

```sql
-- GOOD
CREATE TABLE IF NOT EXISTS PROJECTS ( ... );
DROP TABLE IF EXISTS PROJECTS;
CREATE INDEX IF NOT EXISTS idx_projects_status ON PROJECTS(status);

-- BAD
CREATE TABLE PROJECTS ( ... );  -- Fails if table already exists
```

### 2. Data Integrity at DB Level

Don't rely only on the app to validate. The database is the last line of defense.

```sql
-- GOOD — DB enforces rules even if app has a bug
contract_amount DECIMAL(15,2) NOT NULL CHECK (contract_amount > 0),
budgeted_gp_pct DECIMAL(5,2) NOT NULL CHECK (budgeted_gp_pct BETWEEN 0 AND 100),
status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','ON_HOLD','CANCELLED')),
CONSTRAINT chk_dates CHECK (end_date >= start_date)

-- BAD — only app validates, DB accepts anything
contract_amount DECIMAL(15,2),  -- Nullable, no check, could be negative
```

### 3. Query Performance

Never `SELECT *` in production. Select only needed columns. Use EXPLAIN ANALYZE for complex queries.

```sql
-- GOOD
SELECT id, name, status FROM PROJECTS WHERE status = 'ACTIVE';

-- BAD
SELECT * FROM PROJECTS;  -- Fetches all columns including large text fields
```

### 4. Parameterized Queries Only

Never concatenate values into SQL strings. Always use $1, $2, etc. This prevents SQL injection.

```typescript
// GOOD
await query("SELECT * FROM PROJECTS WHERE id = $1", [projectId]);

// BAD — SQL injection vulnerability
await query("SELECT * FROM PROJECTS WHERE id = '" + projectId + "'");
```

### 5. Atomic Operations

Multi-table operations always go in transactions. If one part fails, everything rolls back.

```typescript
// GOOD — all or nothing
await transaction(async (client) => {
  const snap = await client.query("INSERT INTO PROJECTION_SNAPSHOTS ...");
  for (const detail of details) {
    await client.query("INSERT INTO PROJECTION_DETAILS ...");
  }
});

// BAD — partial state if second insert fails
await query("INSERT INTO PROJECTION_SNAPSHOTS ...");
await query("INSERT INTO PROJECTION_DETAILS ..."); // If this fails, snapshot exists without details
```

## Infrastructure / CDK Principles

### 1. Infrastructure as Code

Every AWS resource is defined in CDK. Nothing is created manually in the console. If it's not in code, it doesn't exist.

### 2. Environment Parity

Dev, staging, and prod use the same CDK stacks with different parameters. No special scripts for one environment.

```typescript
// GOOD — same stack, different config
const config = app.node.tryGetContext(environment);
new DatabaseStack(app, "DB", { minCapacity: config.auroraMin, maxCapacity: config.auroraMax });

// BAD — separate stacks per environment with duplicated code
new DevDatabaseStack(app, "DevDB", { ... });
new ProdDatabaseStack(app, "ProdDB", { ... });
```

### 3. Least Privilege IAM

Each Lambda has its own role with only the permissions it needs. Don't share roles between Lambdas.

```typescript
// GOOD — specific permissions
dbSecret.grantRead(projectsFn);
rdsProxy.grantConnect(projectsFn, "dbadmin");

// BAD — overly broad
projectsFn.role.addManagedPolicy(
  ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
);
```

## Testing Principles

### 1. Test Behavior, Not Implementation

Test what the component does from the user's perspective, not how it does it internally.

```typescript
// GOOD — tests what the user sees
expect(screen.getByText("$15,190,000.00")).toBeInTheDocument();

// BAD — tests internal state
expect(component.state.formattedAmount).toBe("$15,190,000.00");
```

### 2. Isolated Tests

Each test is independent. No test depends on the order or result of another test. Always clean up mocks.

```typescript
// GOOD
afterEach(() => {
  vi.clearAllMocks();
});

it("creates a project", async () => {
  // Self-contained setup, execution, assertion
});

// BAD — depends on previous test having created a project
it("updates the project", async () => {
  // Assumes project from previous test exists
});
```

## AI Code Anti-Patterns

Common silent errors in AI-generated code. These MUST be caught and avoided.

### 1. Swallowed Errors

Never generate empty catch blocks or catch blocks that only log. Every error must be either re-thrown, returned to the caller, or handled with user-visible feedback.

```typescript
// FORBIDDEN
try {
  await save(data);
} catch (e) {
  console.log(e);
} // User thinks it saved. It didn't.

// REQUIRED
try {
  await save(data);
} catch (e) {
  logger.error("Failed to save", e);
  throw new ApiError("DATABASE_ERROR", "Failed to save data", 500);
}
```

### 2. Race Conditions

Never read-then-write without protection. Use database transactions, optimistic locking (version column), or atomic operations.

```typescript
// FORBIDDEN — two concurrent requests can overwrite each other
const balance = await getBalance(id);
await setBalance(id, balance - amount);

// REQUIRED — atomic operation
await query(
  "UPDATE ACCOUNTS SET balance = balance - $1 WHERE id = $2 AND balance >= $1",
  [amount, id],
);
```

### 3. Partial State Updates

Never do multi-table writes without a transaction. If step 2 fails, step 1 must roll back.

```typescript
// FORBIDDEN
await query("INSERT INTO SNAPSHOTS ...");
await query("INSERT INTO DETAILS ..."); // If this fails = orphaned snapshot

// REQUIRED
await transaction(async (client) => {
  await client.query("INSERT INTO SNAPSHOTS ...");
  await client.query("INSERT INTO DETAILS ...");
});
```

### 4. Off-by-One and Boundary Errors

Always verify pagination math, array slicing, and date range boundaries. Test with 0 items, 1 item, and exactly pageSize items.

```typescript
// VERIFY THIS PATTERN — common source of off-by-one
const offset = (page - 1) * pageSize; // page=1 -> offset=0 (correct)
const sql = "SELECT ... LIMIT $1 OFFSET $2";
const params = [pageSize, offset];
```

### 5. Hardcoded Locale/Timezone Assumptions

Never assume UTC, en-US, or USD. Use explicit formats and let the database handle timezone conversions.

```typescript
// FORBIDDEN — ambiguous date parsing
const date = new Date("01/15/2025");

// REQUIRED — explicit ISO format
const date = new Date("2025-01-15T00:00:00Z");

// REQUIRED — explicit currency formatting
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
  amount,
);
```

### 6. React Memory Leaks

Every useEffect that creates a subscription, interval, or event listener MUST return a cleanup function.

```typescript
// FORBIDDEN — interval runs forever after unmount
useEffect(() => {
  const id = setInterval(fetchData, 5000);
}, []);

// REQUIRED — cleanup on unmount
useEffect(() => {
  const id = setInterval(fetchData, 5000);
  return () => clearInterval(id);
}, []);
```

Also: cancel pending fetch requests on unmount using AbortController.

```typescript
useEffect(() => {
  const controller = new AbortController();
  fetch("/api/data", { signal: controller.signal })
    .then(setData)
    .catch(() => {});
  return () => controller.abort();
}, []);
```

### 7. SQL Injection via Concatenation

Never build SQL by concatenating variables. Always use parameterized queries ($1, $2). This applies especially to dynamic WHERE/ORDER clauses.

```typescript
// FORBIDDEN
const sql = `SELECT * FROM PROJECTS WHERE status = '${status}'`;

// REQUIRED
const sql = "SELECT * FROM PROJECTS WHERE status = $1";
const result = await query(sql, [status]);
```

For dynamic column names (ORDER BY, etc.) that can't be parameterized, use a whitelist:

```typescript
const ALLOWED_SORT = ["name", "created_at", "status"];
const sortCol = ALLOWED_SORT.includes(sort) ? sort : "name";
const sql = `SELECT ... ORDER BY ${sortCol}`; // Safe — whitelisted
```

### 8. Incomplete Validation

Always validate edge cases, not just the happy path. Check: empty strings, 0, negative numbers, null vs undefined, empty arrays, strings that look like numbers.

```typescript
// FORBIDDEN — only validates presence
if (body.amount) { ... }  // Fails for amount=0 (falsy but valid)

// REQUIRED — explicit check
if (body.amount !== undefined && body.amount !== null) { ... }

// BEST — use Zod, it handles all edge cases
const schema = z.object({ amount: z.number().min(0) });
```

### 9. Secrets in Code

Never hardcode API keys, passwords, connection strings, or tokens. Always use environment variables or Secrets Manager.

```typescript
// FORBIDDEN
const API_KEY = "sk_live_abc123";
const DB_URL = "postgres://admin:password@host/db";

// REQUIRED
const secretArn = process.env.DATABASE_SECRET_ARN;
const credentials = await getSecret(secretArn);
```

### 10. Retry Without Backoff

Never retry in a tight loop. Always use exponential backoff with a max retry limit. Unbounded retries can DDoS your own services.

```typescript
// FORBIDDEN — hammers the service
while (true) {
  try { return await callApi(); }
  catch { continue; }
}

// REQUIRED — exponential backoff with limit
for (let attempt = 0; attempt < 3; attempt++) {
  try { return await callApi(); }
  catch {
    if (attempt === 2) throw;
    await sleep(Math.pow(2, attempt) * 1000);  // 1s, 2s, 4s
  }
}
```

## Classic Anti-Patterns

Development anti-patterns that apply to this project. Avoid these regardless of whether code is AI-generated or hand-written.

### Backend / Lambda

#### 1. God Function

A single function that does validation + business logic + SQL + response formatting in 200 lines. Split into focused functions.

```typescript
// FORBIDDEN — one function does everything
async function createProject(event) {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) throw new Error("No auth");
  const groups = claims["cognito:groups"].split(",");
  if (!groups.includes("ProjectManager")) throw new Error("Forbidden");
  const body = JSON.parse(event.body);
  if (!body.name) throw new Error("Name required");
  if (body.contractAmount <= 0) throw new Error("Invalid amount");
  const result = await query("INSERT INTO PROJECTS ...", [...]);
  return { statusCode: 201, body: JSON.stringify({ data: result.rows[0] }) };
}

// REQUIRED — each concern is a separate function
async function createProject(event) {
  const user = getUserFromEvent(event);
  requireRole(user, "ProjectManager");
  const body = validateBody(CreateProjectSchema, parseBody(event.body));
  const project = await query("INSERT INTO PROJECTS ...", [...]);
  return successResponse(project.rows[0], 201);
}
```

#### 2. N+1 Queries

Never query inside a loop. Use JOINs or WHERE IN.

```typescript
// FORBIDDEN — 1 query per employee
const employees = await query("SELECT * FROM EMPLOYEES WHERE project_id = $1", [
  projectId,
]);
for (const emp of employees.rows) {
  emp.laborRate = await query("SELECT * FROM LABOR_RATES WHERE id = $1", [
    emp.labor_rate_id,
  ]);
}

// REQUIRED — single query with JOIN
const employees = await query(
  `SELECT e.*, lr.code, lr.hourly_rate
   FROM EMPLOYEES e JOIN LABOR_RATES lr ON lr.id = e.labor_rate_id
   WHERE e.project_id = $1`,
  [projectId],
);
```

#### 3. Premature Optimization

Don't add caching, custom pooling, or complex indexes before measuring a real performance problem.

```typescript
// FORBIDDEN — caching before there's a problem
const projectCache = new Map();
async function getProject(id) {
  if (projectCache.has(id)) return projectCache.get(id);
  const result = await query("SELECT ...", [id]);
  projectCache.set(id, result);
  return result;
}

// REQUIRED — simple and direct, optimize when needed
async function getProject(id) {
  return await query("SELECT ... WHERE id = $1", [id]);
}
```

#### 4. Magic Strings / Numbers

Don't scatter raw strings and numbers through the code. Use constants.

```typescript
// FORBIDDEN
if (user.role === "ProjectManager") { ... }
return { statusCode: 400, ... };
if (status === "ACTIVE") { ... }

// REQUIRED
const ROLES = { ADMIN: "Admin", PM: "ProjectManager", VIEWER: "Viewer" } as const;
const STATUS = { ACTIVE: "ACTIVE", COMPLETED: "COMPLETED", ON_HOLD: "ON_HOLD", CANCELLED: "CANCELLED" } as const;

if (user.role === ROLES.PM) { ... }
if (status === STATUS.ACTIVE) { ... }
```

#### 5. Shotgun Surgery

If adding a field (e.g., `burdenPct`) requires touching 8+ files, the code lacks proper abstraction. Field maps, schemas, and column lists should be defined once per domain.

### Frontend / React

#### 6. Prop Drilling

Don't pass props through 4+ component levels. Use context or composition.

```typescript
// FORBIDDEN — drilling projectId through 4 levels
<Page projectId={id}>
  <Section projectId={id}>
    <Panel projectId={id}>
      <Widget projectId={id} />

// REQUIRED — context or composition
const ProjectContext = createContext<string>("");
<ProjectContext.Provider value={id}>
  <Page><Section><Panel><Widget /></Panel></Section></Page>
</ProjectContext.Provider>

// Inside Widget:
const projectId = useContext(ProjectContext);
```

#### 7. Premature Abstraction

Don't create a `GenericTable` with 20 config props before you have 2 tables. Duplicate first, abstract when the pattern is clear.

```typescript
// FORBIDDEN — abstracting before the pattern is clear
<GenericTable
  columns={cols} data={data} sortable filterable paginated
  onSort={...} onFilter={...} onPage={...} renderRow={...}
  emptyState={...} loadingState={...} errorState={...}
/>

// REQUIRED — start simple, extract when you see repetition
<BudgetTable lines={lines} />
<TimeEntryTable entries={entries} />
// After building both, THEN extract shared patterns if they exist
```

#### 8. useEffect for Everything

useEffect is for external side effects (fetch, subscriptions). Not for deriving state, syncing state, or handling events.

```typescript
// FORBIDDEN — useEffect to derive state
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((s, i) => s + i.amount, 0));
}, [items]);

// REQUIRED — useMemo for derived values
const total = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);

// FORBIDDEN — useEffect as event handler
useEffect(() => {
  if (submitted) {
    saveData();
  }
}, [submitted]);

// REQUIRED — call directly from the event handler
function handleSubmit() {
  saveData();
}
```

#### 9. Stale Closures

Callbacks that capture old state values because dependencies are missing. Always include all dependencies in useCallback/useEffect arrays.

```typescript
// FORBIDDEN — stale closure, lines is always the initial value
const handleSave = useCallback(() => {
  api.save(lines); // lines is stale
}, []); // Missing dependency

// REQUIRED
const handleSave = useCallback(() => {
  api.save(lines);
}, [lines]);
```

#### 10. Conditional Hook Calls

Never call hooks inside if/else, loops, or after early returns. React requires hooks to be called in the same order every render.

```typescript
// FORBIDDEN
function Component({ showData }) {
  if (showData) {
    const data = useQuery("projects");  // Hook inside condition
  }
}

// REQUIRED
function Component({ showData }) {
  const data = useQuery("projects");  // Always called
  if (!showData) return null;
  return <div>{data}</div>;
}
```

### Database

#### 11. Implicit Casting

Never rely on PostgreSQL implicit type casting. Be explicit about types.

```sql
-- FORBIDDEN — comparing UUID column with untyped string
WHERE id = '123'  -- Works sometimes, fails silently other times

-- REQUIRED — explicit cast or parameterized query
WHERE id = $1::uuid
```

#### 12. Missing Indexes on Foreign Keys

Every foreign key column MUST have an index. Without it, JOINs and CASCADE deletes become full table scans.

```sql
-- REQUIRED — always index FK columns
CREATE INDEX idx_budget_lines_project_id ON BUDGET_LINES(project_id);
CREATE INDEX idx_budget_lines_cost_code_id ON BUDGET_LINES(cost_code_id);
```

### General

#### 13. Boolean Blindness

Don't use multiple boolean parameters. Use an options object with named fields.

```typescript
// FORBIDDEN — what does true, false, true mean?
createProject(data, true, false, true);

// REQUIRED — self-documenting
createProject(data, { validate: true, notify: false, audit: true });
```

#### 14. Stringly Typed

Don't use raw strings for status, roles, or types without validation. A typo like "ACTVE" passes silently.

```typescript
// FORBIDDEN — raw string, no validation
function setStatus(status: string) { ... }
setStatus("ACTVE");  // Typo, no error

// REQUIRED — union type or const object
type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED";
function setStatus(status: ProjectStatus) { ... }
setStatus("ACTVE");  // TypeScript error at compile time
```
