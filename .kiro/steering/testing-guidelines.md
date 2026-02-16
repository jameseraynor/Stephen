# Testing Guidelines

This document defines testing patterns and conventions for unit tests with Vitest.

## Testing Philosophy

For MVP:
- Focus on unit tests for business logic
- Test critical paths and edge cases
- Aim for 70%+ code coverage on core logic
- Integration and E2E tests are future roadmap

## Test File Structure

### File Naming
```
src/
├── components/
│   ├── ProjectCard.tsx
│   └── ProjectCard.test.tsx
├── hooks/
│   ├── useProjects.ts
│   └── useProjects.test.ts
├── utils/
│   ├── formatCurrency.ts
│   └── formatCurrency.test.ts
└── services/
    ├── projectsApi.ts
    └── projectsApi.test.ts
```

### Test File Pattern
```typescript
// Component.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with required props', () => {
      // Test
    });

    it('renders with optional props', () => {
      // Test
    });
  });

  describe('interactions', () => {
    it('handles click events', () => {
      // Test
    });
  });

  describe('edge cases', () => {
    it('handles empty data', () => {
      // Test
    });

    it('handles error states', () => {
      // Test
    });
  });
});
```

## Component Testing

### Basic Component Test
```typescript
// components/ProjectCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: '123',
    name: 'Citizens Medical Center',
    jobNumber: '23CON0002',
    contractAmount: 15190000,
    budgetedGpPct: 31.5,
    status: 'ACTIVE'
  };

  it('renders project name', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Citizens Medical Center')).toBeInTheDocument();
  });

  it('renders job number', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('23CON0002')).toBeInTheDocument();
  });

  it('formats contract amount as currency', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('$15,190,000.00')).toBeInTheDocument();
  });

  it('displays status badge', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard interactions', () => {
  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const mockProject = { id: '123', name: 'Test Project' };

    render(<ProjectCard project={mockProject} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith('123');
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    const mockProject = { id: '123', name: 'Test Project' };

    render(<ProjectCard project={mockProject} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('123');
  });
});
```

### Testing Conditional Rendering
```typescript
describe('ProjectCard conditional rendering', () => {
  it('shows edit button when user has permission', () => {
    render(<ProjectCard project={mockProject} canEdit={true} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('hides edit button when user lacks permission', () => {
    render(<ProjectCard project={mockProject} canEdit={false} />);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProjectCard project={mockProject} isLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    const error = new Error('Failed to load project');
    render(<ProjectCard project={mockProject} error={error} />);
    expect(screen.getByText(/failed to load project/i)).toBeInTheDocument();
  });
});
```

## Hook Testing

### Basic Hook Test
```typescript
// hooks/useProjects.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import * as projectsApi from '../services/projectsApi';

vi.mock('../services/projectsApi');

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches projects on mount', async () => {
    const mockProjects = [
      { id: '1', name: 'Project A' },
      { id: '2', name: 'Project B' }
    ];

    vi.mocked(projectsApi.list).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects());

    expect(result.current.loading).toBe(true);
    expect(result.current.projects).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const mockError = new Error('Network error');
    vi.mocked(projectsApi.list).mockRejectedValue(mockError);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.projects).toEqual([]);
  });

  it('refetches data when refetch is called', async () => {
    const mockProjects = [{ id: '1', name: 'Project A' }];
    vi.mocked(projectsApi.list).mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(projectsApi.list).mockClear();
    await result.current.refetch();

    expect(projectsApi.list).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Hook State Updates
```typescript
import { renderHook, act } from '@testing-library/react';

describe('useForm', () => {
  it('updates values when handleChange is called', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { name: '', email: '' }
    }));

    act(() => {
      result.current.handleChange('name', 'John Doe');
    });

    expect(result.current.values.name).toBe('John Doe');
  });

  it('marks field as touched when handleBlur is called', () => {
    const { result } = renderHook(() => useForm({
      initialValues: { name: '' }
    }));

    act(() => {
      result.current.handleBlur('name');
    });

    expect(result.current.touched.name).toBe(true);
  });
});
```

## API Service Testing

### Mocking API Calls
```typescript
// services/projectsApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { API } from 'aws-amplify';
import { projectsApi } from './projectsApi';

vi.mock('aws-amplify', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn()
  }
}));

describe('projectsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('fetches all projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project A' },
        { id: '2', name: 'Project B' }
      ];

      vi.mocked(API.get).mockResolvedValue({ data: mockProjects });

      const result = await projectsApi.list();

      expect(API.get).toHaveBeenCalledWith('api', '/projects', {});
      expect(result).toEqual(mockProjects);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(API.get).mockRejectedValue(mockError);

      await expect(projectsApi.list()).rejects.toThrow('Network error');
    });
  });

  describe('create', () => {
    it('creates a new project', async () => {
      const newProject = {
        name: 'New Project',
        jobNumber: '23CON0003',
        contractAmount: 1000000
      };

      const createdProject = { id: '123', ...newProject };
      vi.mocked(API.post).mockResolvedValue({ data: createdProject });

      const result = await projectsApi.create(newProject);

      expect(API.post).toHaveBeenCalledWith('api', '/projects', {
        body: newProject
      });
      expect(result).toEqual(createdProject);
    });
  });

  describe('update', () => {
    it('updates an existing project', async () => {
      const updates = { name: 'Updated Name' };
      const updatedProject = { id: '123', ...updates };

      vi.mocked(API.put).mockResolvedValue({ data: updatedProject });

      const result = await projectsApi.update('123', updates);

      expect(API.put).toHaveBeenCalledWith('api', '/projects/123', {
        body: updates
      });
      expect(result).toEqual(updatedProject);
    });
  });

  describe('delete', () => {
    it('deletes a project', async () => {
      vi.mocked(API.del).mockResolvedValue({});

      await projectsApi.delete('123');

      expect(API.del).toHaveBeenCalledWith('api', '/projects/123', {});
    });
  });
});
```

## Utility Function Testing

### Pure Function Tests
```typescript
// utils/formatCurrency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large numbers', () => {
    expect(formatCurrency(15190000)).toBe('$15,190,000.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(1234.567)).toBe('$1,234.57');
  });

  it('handles null/undefined', () => {
    expect(formatCurrency(null)).toBe('$0.00');
    expect(formatCurrency(undefined)).toBe('$0.00');
  });
});
```

### Business Logic Tests
```typescript
// utils/calculations.test.ts
import { describe, it, expect } from 'vitest';
import { calculateGrossProfit, calculateGpPercentage } from './calculations';

describe('calculateGrossProfit', () => {
  it('calculates GP correctly', () => {
    const contractAmount = 15190000;
    const totalCost = 10405300;
    
    const gp = calculateGrossProfit(contractAmount, totalCost);
    
    expect(gp).toBe(4784700);
  });

  it('handles zero cost', () => {
    expect(calculateGrossProfit(1000000, 0)).toBe(1000000);
  });

  it('handles negative GP', () => {
    expect(calculateGrossProfit(1000000, 1500000)).toBe(-500000);
  });
});

describe('calculateGpPercentage', () => {
  it('calculates GP% correctly', () => {
    const gp = 4784700;
    const contractAmount = 15190000;
    
    const gpPct = calculateGpPercentage(gp, contractAmount);
    
    expect(gpPct).toBeCloseTo(31.5, 1);
  });

  it('handles zero contract amount', () => {
    expect(calculateGpPercentage(100000, 0)).toBe(0);
  });

  it('returns percentage between 0-100', () => {
    const result = calculateGpPercentage(500000, 1000000);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

## Mocking Patterns

### Mocking Modules
```typescript
// Mock entire module
vi.mock('../services/projectsApi', () => ({
  projectsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock specific functions
vi.mock('../utils/formatCurrency', () => ({
  formatCurrency: vi.fn((value) => `$${value}`)
}));
```

### Mocking AWS Amplify
```typescript
vi.mock('aws-amplify', () => ({
  API: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn()
  },
  Auth: {
    currentAuthenticatedUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn()
  }
}));
```

### Mocking React Router
```typescript
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '123' })
  };
});

// Wrapper for tests
function renderWithRouter(component: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/projects/123']}>
      {component}
    </MemoryRouter>
  );
}
```

### Mocking Date/Time
```typescript
import { vi } from 'vitest';

describe('time-sensitive tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses mocked date', () => {
    const now = new Date();
    expect(now.toISOString()).toBe('2025-01-15T10:00:00.000Z');
  });
});
```

## Test Helpers

### Custom Render Function
```typescript
// test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

interface CustomRenderOptions extends RenderOptions {
  initialRoute?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialRoute = '/', ...options }: CustomRenderOptions = {}
) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      {ui}
    </MemoryRouter>,
    options
  );
}

// Usage
import { renderWithProviders } from '../test/utils';

it('renders with router', () => {
  renderWithProviders(<ProjectCard project={mockProject} />);
});
```

### Mock Data Factories
```typescript
// test/factories.ts
export function createMockProject(overrides = {}) {
  return {
    id: '123',
    name: 'Test Project',
    jobNumber: '23CON0001',
    contractAmount: 1000000,
    budgetedGpPct: 30,
    status: 'ACTIVE',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    ...overrides
  };
}

export function createMockBudgetLine(overrides = {}) {
  return {
    id: '456',
    projectId: '123',
    costCodeId: '789',
    description: 'Test Budget Line',
    budgetedAmount: 50000,
    ...overrides
  };
}

// Usage
const project = createMockProject({ name: 'Custom Name' });
```

## Coverage Requirements

### Target Coverage
- Overall: 70%+
- Critical business logic: 90%+
- Utility functions: 80%+
- Components: 60%+

### Running Coverage
```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Configuration (vitest.config.ts)
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
```

## Test Organization

### What to Test
✅ **Do test:**
- Business logic and calculations
- User interactions (clicks, form submissions)
- Conditional rendering
- Error handling
- Edge cases (empty data, null values)
- API service functions
- Utility functions

❌ **Don't test:**
- Third-party libraries (shadcn/ui, React Router)
- Implementation details (internal state)
- Styling and CSS
- Trivial getters/setters

## Common Pitfalls

❌ **Don't:**
- Test implementation details
- Write tests that depend on other tests
- Use real API calls in tests
- Forget to clean up mocks
- Test too many things in one test

✅ **Do:**
- Test behavior, not implementation
- Keep tests isolated and independent
- Mock external dependencies
- Clear mocks between tests
- Write focused, single-purpose tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test ProjectCard.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```
