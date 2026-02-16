# Project Diagrams

Visual documentation of the Project Cost Control System architecture, flows, and data models.

## 📁 Directory Structure

```
diagrams/
├── architecture/          # System architecture and components
│   ├── 01-aws-infrastructure.puml
│   ├── 02-frontend-components.puml
│   └── 03-use-cases.puml
├── data-model/           # Database and data flow
│   ├── 01-database-schema.puml
│   └── 02-data-pipeline.puml
├── flows/                # User and system flows
│   ├── 01-authentication.puml
│   ├── 02-project-creation.puml
│   └── 03-time-entry.puml
└── deployment/           # Deployment and infrastructure
    └── 01-deployment-process.puml
```

---

## 🏗️ Architecture Diagrams

### 1. AWS Infrastructure

**File:** `architecture/01-aws-infrastructure.puml`

Shows the complete AWS serverless architecture including CloudFront, API Gateway, Lambda, Aurora, and Cognito.

**Key Components:**

- Frontend: CloudFront + S3
- API Layer: API Gateway + Cognito Authorizer
- Compute: 5 Lambda functions (Projects, Budget, Time Entry, Actuals, Projections)
- Database: Aurora Serverless v2 (PostgreSQL 16)
- Security: Secrets Manager, VPC
- Monitoring: CloudWatch

**Use Cases:**

- Understanding system architecture
- Infrastructure planning
- Security reviews
- Onboarding new developers

---

### 2. Frontend Components

**File:** `architecture/02-frontend-components.puml`

Component hierarchy showing React application structure, hooks, services, and dependencies.

**Key Components:**

- Pages and routing
- Feature components (Projects, Budget, Time Entry, Actuals, Projections)
- Shared components (DataTable, FormField, DatePicker)
- UI components (shadcn/ui)
- Custom hooks (useProjects, useBudget, useAuth)
- API services

**Use Cases:**

- Understanding frontend architecture
- Planning new features
- Component refactoring
- Code organization

---

### 3. Use Cases

**File:** `architecture/03-use-cases.puml`

All system use cases organized by category with role-based permissions.

**Actors:**

- Admin (full access)
- Project Manager (assigned projects)
- Viewer (read-only)

**Categories:**

- Authentication (Login, SSO, MFA, Logout)
- Project Management (CRUD operations)
- Budget Management
- Employee Management
- Time Entry
- Actuals Tracking
- Projections
- Reporting
- Administration

**Use Cases:**

- Requirements documentation
- Permission planning
- Feature planning
- User training

---

## 💾 Data Model Diagrams

### 1. Database Schema (ERD)

**File:** `data-model/01-database-schema.puml`

Entity-Relationship Diagram showing all database tables, columns, and relationships.

**Tables:**

- USERS, PROJECTS
- BUDGET_LINES, COST_CODES
- EMPLOYEES, LABOR_RATES
- DAILY_TIME_ENTRIES
- ACTUALS
- PROJECTION_SNAPSHOTS, PROJECTION_DETAILS

**Key Features:**

- Primary keys (UUID)
- Foreign key relationships
- Data types and constraints
- Indexes

**Use Cases:**

- Database schema design
- Understanding data relationships
- Writing queries
- Planning migrations

---

### 2. Data Pipeline

**File:** `data-model/02-data-pipeline.puml`

Shows how data flows through the system from input to output, including calculations.

**Flow Stages:**

1. Input Sources (Users, Excel, Spectrum ERP)
2. Data Entry (Projects, Budget, Employees, Time, Actuals)
3. Data Storage (Database tables)
4. Calculations (Aggregations, GP, Variance, Projections)
5. Outputs (Dashboard, Reports, Exports)

**Key Calculations:**

- Time aggregation to actuals
- Gross Profit calculation
- Variance analysis
- Projection logic

**Use Cases:**

- Understanding business logic
- Data pipeline design
- Calculation verification
- Integration planning

---

## 🔄 Flow Diagrams

### 1. Authentication Flow

**File:** `flows/01-authentication.puml`

Sequence diagram showing all authentication processes.

**Flows:**

- Email/Password login
- Microsoft SSO login
- MFA setup (TOTP)
- Authenticated API calls
- Token refresh
- Logout

**Use Cases:**

- Implementing authentication
- Debugging auth issues
- Security audits
- User onboarding

---

### 2. Project Creation Flow

**File:** `flows/02-project-creation.puml`

Detailed sequence diagram for creating a new project.

**Steps:**

- Form validation (frontend + backend)
- API request/response
- Permission checks
- Database transaction
- Duplicate detection
- Error handling
- Success response

**Use Cases:**

- Understanding CRUD operations
- Implementing similar features
- Debugging issues
- API documentation

---

### 3. Time Entry Flow

**File:** `flows/03-time-entry.puml`

Sequence diagram for daily time entry process.

**Steps:**

- Loading employees and existing entries
- Entering time for multiple employees
- Batch saving
- Duplicate handling (update vs insert)
- Summary calculation

**Use Cases:**

- Understanding time entry workflow
- Implementing batch operations
- Handling duplicates
- Data validation

---

## 🚀 Deployment Diagrams

### 1. Deployment Process

**File:** `deployment/01-deployment-process.puml`

Shows how the application is deployed to AWS using CDK.

**Processes:**

- CDK deployment workflow
- Frontend deployment (S3 + CloudFront)
- Backend deployment (Lambda)
- Database setup
- Infrastructure as Code

**Components:**

- Developer workstation
- GitHub repository
- CloudFormation
- S3 buckets (CDK assets, frontend, Lambda code)
- Runtime connections

**Use Cases:**

- Deployment planning
- CI/CD setup
- Infrastructure updates
- Troubleshooting deployments

---

## 🛠️ Working with Diagrams

### Viewing Diagrams

#### Option 1: VS Code (Recommended)

1. Install PlantUML extension (already configured)
2. Open any `.puml` file
3. Press `Option+D` (Mac) or `Alt+D` (Windows/Linux)

#### Option 2: View PNG Images

All diagrams have pre-generated PNG images in the same directory.

#### Option 3: Online Viewer

Copy the `.puml` content and paste into:

- http://www.plantuml.com/plantuml/uml/
- https://www.planttext.com/

### Generating PNG Images

Generate all diagrams:

```bash
cd docs/diagrams
find . -name "*.puml" -exec plantuml {} \;
```

Generate specific category:

```bash
cd docs/diagrams/architecture
plantuml *.puml
```

Generate single diagram:

```bash
plantuml docs/diagrams/architecture/01-aws-infrastructure.puml
```

### Updating Diagrams

1. Edit the `.puml` file
2. Regenerate PNG: `plantuml filename.puml`
3. Commit both `.puml` and `.png` files
4. Update this README if needed

---

## 📚 PlantUML Resources

- [Official Documentation](https://plantuml.com/)
- [Sequence Diagram Guide](https://plantuml.com/sequence-diagram)
- [Class Diagram Guide](https://plantuml.com/class-diagram)
- [Component Diagram Guide](https://plantuml.com/component-diagram)
- [Use Case Diagram Guide](https://plantuml.com/use-case-diagram)

---

## 🎨 Diagram Conventions

### Colors

- **Blue**: External services (Cognito, CloudFront)
- **Green**: Success paths
- **Red**: Error paths
- **Yellow**: Warnings or important notes

### Naming

- Files are numbered for logical ordering
- Use kebab-case for file names
- Include descriptive titles in diagrams

### Notes

- Add notes for important business rules
- Include configuration details
- Document constraints and validations

---

## 📝 Maintenance

Update diagrams when:

- ✅ Architecture changes
- ✅ New features are added
- ✅ Database schema changes
- ✅ API endpoints change
- ✅ User flows change
- ✅ Component structure changes

**Keep diagrams in sync with actual implementation!**

---

## 🔍 Quick Reference

| Need to understand...       | See diagram...                             |
| --------------------------- | ------------------------------------------ |
| Overall system architecture | `architecture/01-aws-infrastructure.puml`  |
| Frontend structure          | `architecture/02-frontend-components.puml` |
| User permissions            | `architecture/03-use-cases.puml`           |
| Database tables             | `data-model/01-database-schema.puml`       |
| Data calculations           | `data-model/02-data-pipeline.puml`         |
| Login process               | `flows/01-authentication.puml`             |
| CRUD operations             | `flows/02-project-creation.puml`           |
| Time entry                  | `flows/03-time-entry.puml`                 |
| Deployment                  | `deployment/01-deployment-process.puml`    |
