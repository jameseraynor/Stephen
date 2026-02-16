# API Client & Hooks Setup

Complete implementation of API client infrastructure with AWS Amplify integration.

## ✅ Completed

### 1. AWS Amplify Configuration

- **File**: `src/lib/aws-config.ts`
- Configures Cognito authentication
- Configures API Gateway endpoint
- Environment variable based configuration
- MFA and password policy settings

### 2. API Client Base

- **File**: `src/lib/api-client.ts`
- RESTful methods: GET, POST, PUT, DELETE
- Automatic authentication via Amplify
- Centralized error handling
- Query string builder for pagination
- Custom `ApiClientError` class

### 3. Custom Hooks

#### useAuth Hook

- **File**: `src/hooks/useAuth.ts`
- Login/logout functionality
- Signup and confirmation
- User state management
- Role-based access (Admin, ProjectManager, Viewer)
- Automatic session refresh

#### useApi Hook

- **File**: `src/hooks/useApi.ts`
- Generic hook for GET requests
- Loading, error, and data state
- Automatic error handling
- Reset and clear error functions

#### useApiMutation Hook

- **File**: `src/hooks/useApi.ts`
- Specialized for POST, PUT, DELETE
- Optimized for mutations
- No data state (only loading/error)

#### useProjects Hook

- **File**: `src/hooks/useProjects.ts`
- Example of resource-specific hook
- CRUD operations
- Auto-fetch on mount
- Refetch after mutations

### 4. API Services

#### Projects API

- **File**: `src/services/projects.api.ts`
- List, get, create, update, delete
- Project summary endpoint
- Pagination support
- Type-safe with TypeScript

### 5. Documentation

- **File**: `src/services/README.md`
- Usage patterns
- Examples
- Testing guidelines

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Components                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Custom Hooks                            │
│  useAuth, useProjects, useApi, useApiMutation               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Services                            │
│  projectsApi, budgetApi, employeesApi, etc.                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Client                              │
│  GET, POST, PUT, DELETE + Error Handling                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    AWS Amplify                               │
│  Authentication + API Gateway Integration                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  AWS Backend                                 │
│  API Gateway → Lambda → Aurora                              │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Authentication

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, isLoading, error, user, isAuthenticated } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
```

### Fetching Data

```typescript
import { useProjects } from '@/hooks/useProjects';

function ProjectsList() {
  const { projects, isLoading, error, refetch } = useProjects();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <Button onClick={refetch}>Refresh</Button>
    </div>
  );
}
```

### Creating Data

```typescript
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

function CreateProjectForm() {
  const { create, isCreating } = useProjects({ autoFetch: false });
  const { toast } = useToast();

  const handleSubmit = async (data: CreateProject) => {
    try {
      await create(data);
      toast({ title: 'Success', description: 'Project created!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return <ProjectForm onSubmit={handleSubmit} isLoading={isCreating} />;
}
```

### Updating Data

```typescript
import { useProject } from '@/hooks/useProjects';

function EditProjectPage({ projectId }: { projectId: string }) {
  const { project, isLoading, refetch } = useProject(projectId);
  const { update, isUpdating } = useProjects({ autoFetch: false });

  const handleSubmit = async (data: UpdateProject) => {
    await update(projectId, data);
    await refetch();
  };

  if (isLoading) return <Spinner />;

  return <ProjectForm
    initialData={project}
    onSubmit={handleSubmit}
    isLoading={isUpdating}
  />;
}
```

## Error Handling

All errors are instances of `ApiClientError`:

```typescript
interface ApiClientError extends Error {
  code: string; // Error code (e.g., 'VALIDATION_ERROR')
  message: string; // User-friendly message
  details?: Record<string, string>; // Field-level errors
  statusCode?: number; // HTTP status code
  requestId?: string; // Request ID for debugging
}
```

### Handling Errors

```typescript
try {
  await projectsApi.create(data);
} catch (error) {
  if (error instanceof ApiClientError) {
    // Show user-friendly message
    toast.error(error.message);

    // Log for debugging
    console.error("Error code:", error.code);
    console.error("Request ID:", error.requestId);

    // Show field-level errors
    if (error.details) {
      Object.entries(error.details).forEach(([field, message]) => {
        setFieldError(field, message);
      });
    }
  }
}
```

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# AWS Cognito
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Gateway
VITE_API_ENDPOINT=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# AWS Region
VITE_AWS_REGION=us-east-1
```

## Next Steps

### Create Additional API Services

Follow the pattern in `projects.api.ts`:

1. **Budget API** (`services/budget.api.ts`)
   - List budget lines for project
   - Create, update, delete budget lines

2. **Employees API** (`services/employees.api.ts`)
   - List employees for project
   - Add, update, remove employees

3. **Time Entries API** (`services/time-entries.api.ts`)
   - List time entries
   - Create, update, delete entries
   - Query by date range

4. **Actuals API** (`services/actuals.api.ts`)
   - Get monthly actuals
   - Create/update actuals

5. **Projections API** (`services/projections.api.ts`)
   - List snapshots
   - Create, update, delete snapshots
   - Get snapshot details

6. **Reference Data APIs**
   - Cost codes (`services/cost-codes.api.ts`)
   - Labor rates (`services/labor-rates.api.ts`)

### Create Custom Hooks

For each resource, create a custom hook:

- `useEmployees(projectId)`
- `useTimeEntries(projectId, filters)`
- `useActuals(projectId, month)`
- `useProjections(projectId)`
- `useCostCodes()`
- `useLaborRates()`

### Testing

Write tests for:

- API client error handling
- Hook state management
- Authentication flows
- API service mocking

## Benefits

✅ **Consistent Pattern**: All API calls follow the same structure
✅ **Type Safety**: Full TypeScript support
✅ **Error Handling**: Centralized error handling
✅ **Loading States**: Automatic loading state management
✅ **Authentication**: Automatic token management
✅ **Reusability**: Hooks can be reused across components
✅ **Testability**: Easy to mock and test
✅ **Maintainability**: Clear separation of concerns
