# Project Diagrams

This directory contains PlantUML diagrams that visualize the system architecture, data flows, and processes.

## Viewing Diagrams

### Online Viewers
- [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
- [PlantText](https://www.planttext.com/)

### VS Code Extension
Install the [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) to preview diagrams directly in VS Code.

### Command Line
```bash
# Install PlantUML
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu

# Generate PNG
plantuml architecture.puml

# Generate SVG
plantuml -tsvg architecture.puml

# Generate all diagrams
plantuml *.puml
```

## Diagrams

### 1. Architecture Diagram (`architecture.puml`)
**Purpose:** Shows the complete AWS infrastructure and how components interact.

**Key Components:**
- CloudFront + S3 (Frontend)
- API Gateway + Cognito (API Layer)
- Lambda Functions (Compute)
- Aurora Serverless v2 (Database)
- Secrets Manager (Security)
- CloudWatch (Monitoring)

**Use Cases:**
- Understanding system architecture
- Onboarding new developers
- Infrastructure planning
- Security reviews

---

### 2. Database ERD (`database-erd.puml`)
**Purpose:** Entity-Relationship Diagram showing all database tables and their relationships.

**Key Tables:**
- USERS, PROJECTS
- BUDGET_LINES, COST_CODES
- EMPLOYEES, LABOR_RATES
- DAILY_TIME_ENTRIES
- ACTUALS
- PROJECTION_SNAPSHOTS, PROJECTION_DETAILS

**Use Cases:**
- Database schema design
- Understanding data relationships
- Writing queries
- Planning migrations

---

### 3. Authentication Flow (`authentication-flow.puml`)
**Purpose:** Sequence diagram showing authentication processes.

**Flows Covered:**
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

### 4. Project Creation Flow (`project-creation-flow.puml`)
**Purpose:** Detailed sequence diagram for creating a new project.

**Steps Covered:**
- Form validation
- API request/response
- Permission checks
- Database transaction
- Error handling
- Success response

**Use Cases:**
- Understanding CRUD operations
- Implementing similar features
- Debugging issues
- API documentation

---

### 5. Time Entry Flow (`time-entry-flow.puml`)
**Purpose:** Sequence diagram for daily time entry process.

**Steps Covered:**
- Loading employees
- Loading existing entries
- Entering time for multiple employees
- Batch saving
- Duplicate handling
- Summary calculation

**Use Cases:**
- Understanding time entry workflow
- Implementing batch operations
- Handling duplicates
- Data validation

---

### 6. Component Structure (`component-structure.puml`)
**Purpose:** Frontend component hierarchy and dependencies.

**Components Shown:**
- Pages and routing
- Feature components
- Shared components
- UI components (shadcn/ui)
- Hooks
- Services
- Utils

**Use Cases:**
- Understanding frontend architecture
- Planning new features
- Refactoring components
- Code organization

---

### 7. Deployment Diagram (`deployment.puml`)
**Purpose:** Shows how the application is deployed to AWS.

**Processes Covered:**
- CDK deployment workflow
- Frontend deployment (S3 + CloudFront)
- Backend deployment (Lambda)
- Database setup
- Infrastructure as Code

**Use Cases:**
- Deployment planning
- CI/CD setup
- Infrastructure updates
- Troubleshooting deployments

---

### 8. Use Cases Diagram (`use-cases.puml`)
**Purpose:** Shows all system use cases and user permissions.

**Actors:**
- Admin (full access)
- Project Manager (assigned projects)
- Viewer (read-only)

**Use Case Categories:**
- Authentication
- Project Management
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

### 9. Data Flow Diagram (`data-flow.puml`)
**Purpose:** Shows how data flows through the system from input to output.

**Flow Stages:**
1. **Input Sources:** Users, Excel, Spectrum ERP
2. **Data Entry:** Projects, Budget, Employees, Time, Actuals
3. **Data Storage:** Database tables
4. **Calculations:** Aggregations, GP, Variance, Projections
5. **Outputs:** Dashboard, Reports, Exports

**Key Calculations:**
- Time aggregation to actuals
- GP calculation
- Variance analysis
- Projection logic

**Use Cases:**
- Understanding business logic
- Data pipeline design
- Calculation verification
- Integration planning

---

## Generating All Diagrams

To generate PNG images for all diagrams:

```bash
cd docs/diagrams
plantuml *.puml
```

This will create PNG files alongside each `.puml` file.

## Updating Diagrams

When updating diagrams:

1. Edit the `.puml` file
2. Regenerate the image: `plantuml filename.puml`
3. Commit both the `.puml` source and generated image
4. Update this README if adding new diagrams

## PlantUML Resources

- [Official Documentation](https://plantuml.com/)
- [AWS Icons for PlantUML](https://github.com/awslabs/aws-icons-for-plantuml)
- [PlantUML Cheat Sheet](https://plantuml.com/guide)
- [Sequence Diagram Guide](https://plantuml.com/sequence-diagram)
- [Class Diagram Guide](https://plantuml.com/class-diagram)
- [Component Diagram Guide](https://plantuml.com/component-diagram)

## Tips

### Exporting to Different Formats

```bash
# PNG (default)
plantuml diagram.puml

# SVG (scalable)
plantuml -tsvg diagram.puml

# PDF
plantuml -tpdf diagram.puml

# ASCII art
plantuml -ttxt diagram.puml
```

### Previewing in VS Code

1. Install PlantUML extension
2. Open `.puml` file
3. Press `Alt+D` to preview
4. Preview updates automatically on save

### Including in Documentation

Markdown:
```markdown
![Architecture Diagram](diagrams/architecture.png)
```

HTML:
```html
<img src="diagrams/architecture.png" alt="Architecture Diagram" />
```

## Maintenance

These diagrams should be updated when:
- Architecture changes
- New features are added
- Database schema changes
- API endpoints change
- User flows change
- Component structure changes

Keep diagrams in sync with actual implementation!
