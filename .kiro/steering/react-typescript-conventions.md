---
inclusion: always
---

# React + TypeScript Conventions

This document defines coding standards and patterns for React + TypeScript development in this project.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   ├── features/        # Feature-specific components
│   │   │   ├── projects/
│   │   │   ├── budget/
│   │   │   ├── time-entry/
│   │   │   └── reports/
│   │   └── shared/          # Shared components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   ├── types/               # TypeScript type definitions
│   ├── services/            # API clients
│   ├── stores/              # State management (if needed)
│   ├── utils/               # Pure utility functions
│   └── App.tsx
├── public/
└── tests/
```

## Naming Conventions

### Files and Folders
```
✅ Good:
components/ProjectCard.tsx
components/budget/BudgetEntryForm.tsx
hooks/useProjects.ts
types/project.ts
utils/formatCurrency.ts

❌ Bad:
components/projectcard.tsx
components/Budget-Entry-Form.tsx
hooks/Projects.ts
types/Project.ts
```

### Components
```typescript
// ✅ PascalCase for components
export function ProjectCard({ project }: ProjectCardProps) {
  return <div>{project.name}</div>;
}

// ✅ Named exports preferred
export function BudgetEntryForm() { }

// ❌ Avoid default exports (harder to refactor)
export default function Component() { }
```

### Hooks
```typescript
// ✅ camelCase, start with 'use'
export function useProjects() { }
export function useAuth() { }
export function useDebounce<T>(value: T, delay: number) { }

// ❌ Bad
export function Projects() { }  // Not a hook
export function getProjects() { }  // Not a hook
```

## TypeScript Patterns

### Props Typing
```typescript
// ✅ Good - Explicit interface
interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  className?: string;
}

export function ProjectCard({ project, onEdit, className }: ProjectCardProps) {
  // ...
}

// ✅ Good - With children
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

// ❌ Bad - Inline types
export function ProjectCard({ project }: { project: any }) { }
```

### Event Handlers
```typescript
// ✅ Good - Explicit types
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // ...
}

function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  // ...
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  // ...
}

// ✅ Good - Custom handlers
function handleProjectSelect(projectId: string) {
  // ...
}
```

### State Typing
```typescript
// ✅ Good - Explicit types
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<Error | null>(null);

// ✅ Good - Complex state
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

const [formState, setFormState] = useState<FormState>({
  values: {},
  errors: {},
  touched: {}
});

// ❌ Bad - Implicit any
const [data, setData] = useState();
```

## Component Patterns

### Functional Components
```typescript
// ✅ Good - Simple component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Compound Components
```typescript
// ✅ Good - Compound pattern
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Conditional Rendering
```typescript
// ✅ Good - Early return
function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyState message="No projects found" />;
  }

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// ✅ Good - Ternary for simple cases
{isLoading ? <Spinner /> : <Content />}

// ✅ Good - Logical AND for optional rendering
{error && <ErrorMessage error={error} />}

// ❌ Bad - Nested ternaries
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : null}
```

## Custom Hooks

### Data Fetching Hook
```typescript
// hooks/useProjects.ts
interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectsApi.list();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, refetch: fetchProjects };
}
```

### Form Hook
```typescript
// hooks/useForm.ts
interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Record<string, string>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    await onSubmit(values);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit
  };
}
```

## API Integration

### API Client Pattern
```typescript
// services/api/projects.ts
import { API } from 'aws-amplify';

export interface Project {
  id: string;
  name: string;
  jobNumber: string;
  contractAmount: number;
  // ...
}

export const projectsApi = {
  async list(): Promise<Project[]> {
    const response = await API.get('api', '/projects', {});
    return response.data;
  },

  async get(id: string): Promise<Project> {
    const response = await API.get('api', `/projects/${id}`, {});
    return response.data;
  },

  async create(data: Omit<Project, 'id'>): Promise<Project> {
    const response = await API.post('api', '/projects', { body: data });
    return response.data;
  },

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const response = await API.put('api', `/projects/${id}`, { body: data });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await API.del('api', `/projects/${id}`, {});
  }
};
```

## Error Handling

```typescript
// ✅ Good - Typed error handling
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

try {
  await projectsApi.create(data);
} catch (error) {
  if (isApiError(error)) {
    console.error(`API Error [${error.code}]: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Performance Optimization

### Memoization
```typescript
// ✅ Good - Memoize expensive calculations
const sortedProjects = useMemo(() => {
  return projects.sort((a, b) => a.name.localeCompare(b.name));
}, [projects]);

// ✅ Good - Memoize callbacks
const handleProjectClick = useCallback((id: string) => {
  navigate(`/projects/${id}`);
}, [navigate]);

// ❌ Bad - Unnecessary memoization
const name = useMemo(() => user.name, [user]);  // Too simple
```

### Code Splitting
```typescript
// ✅ Good - Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const BudgetEntry = lazy(() => import('./pages/BudgetEntry'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budget" element={<BudgetEntry />} />
      </Routes>
    </Suspense>
  );
}
```

## Testing

### Component Tests
```typescript
// components/ProjectCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    name: 'Test Project',
    jobNumber: 'JOB001',
    contractAmount: 100000
  };

  it('renders project name', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<ProjectCard project={mockProject} onEdit={onEdit} />);
    
    screen.getByRole('button', { name: /edit/i }).click();
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

### Hook Tests
```typescript
// hooks/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';

describe('useProjects', () => {
  it('fetches projects on mount', async () => {
    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toHaveLength(2);
  });
});
```

## Common Pitfalls

❌ **Don't:**
- Use `any` type
- Mutate state directly
- Forget dependency arrays in useEffect/useCallback
- Create components inside components
- Use index as key in lists

✅ **Do:**
- Use explicit types
- Use immutable updates
- Include all dependencies
- Extract components to module level
- Use unique IDs as keys
