# API Services

This directory contains API service modules that interact with the backend Lambda functions.

## Structure

```
services/
├── projects.api.ts       # Projects CRUD operations
├── budget.api.ts         # Budget lines operations
├── employees.api.ts      # Employee management
├── time-entries.api.ts   # Time entry operations
├── actuals.api.ts        # Monthly actuals
├── projections.api.ts    # Projection snapshots
├── cost-codes.api.ts     # Cost codes (reference data)
├── labor-rates.api.ts    # Labor rates (reference data)
└── README.md
```

## Pattern

All API services follow the same pattern:

```typescript
import { apiClient } from "@/lib/api-client";
import type { Resource, CreateResource, UpdateResource } from "@/types";

export const resourceApi = {
  async list(params?) {
    return apiClient.get<Resource[]>("/resources", params);
  },

  async get(id: string) {
    return apiClient.get<Resource>(`/resources/${id}`);
  },

  async create(data: CreateResource) {
    return apiClient.post<Resource>("/resources", data);
  },

  async update(id: string, data: UpdateResource) {
    return apiClient.put<Resource>(`/resources/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<null>(`/resources/${id}`);
  },
};
```

## Usage with Hooks

### Basic Usage

```typescript
import { useApi } from '@/hooks/useApi';
import { projectsApi } from '@/services/projects.api';

function ProjectList() {
  const { data, isLoading, error, execute } = useApi(projectsApi.list);

  useEffect(() => {
    execute();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Mutations

```typescript
import { useApiMutation } from '@/hooks/useApi';
import { projectsApi } from '@/services/projects.api';

function CreateProjectForm() {
  const { isLoading, error, mutate } = useApiMutation(projectsApi.create);

  const handleSubmit = async (data: CreateProject) => {
    try {
      await mutate(data);
      toast.success('Project created!');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Custom Hooks

For complex resources, create custom hooks:

```typescript
import { useProjects } from '@/hooks/useProjects';

function ProjectsPage() {
  const {
    projects,
    isLoading,
    create,
    update,
    remove,
  } = useProjects();

  return <div>...</div>;
}
```

## Error Handling

All API calls throw `ApiClientError` on failure:

```typescript
try {
  await projectsApi.create(data);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.code); // Error code
    console.error(error.message); // User-friendly message
    console.error(error.details); // Validation errors
    console.error(error.statusCode); // HTTP status
  }
}
```

## Authentication

All API calls automatically include the Cognito JWT token via AWS Amplify.
No manual token management required.

## Testing

Mock API services in tests:

```typescript
import { vi } from "vitest";
import { projectsApi } from "@/services/projects.api";

vi.mock("@/services/projects.api", () => ({
  projectsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// In test
vi.mocked(projectsApi.list).mockResolvedValue({
  data: [{ id: "1", name: "Test Project" }],
});
```
