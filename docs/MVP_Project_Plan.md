# Project Cost Control System - MVP Plan

## Executive Summary

This document outlines the plan for building a web-based Project Cost Control application that replaces the current Excel-based workflow (`projections.xlsm`). The MVP will enable project managers to track budgets, record actuals, create labor projections, and generate executive summaries for construction projects.

**Timeline:** 4 weeks  
**Target Users:** 2 (MVP), scalable to 100  
**Platform:** AWS Cloud (Serverless)

---

## 1. Business Objectives

| Objective      | Current State (Excel)           | Future State (Web App)       |
| -------------- | ------------------------------- | ---------------------------- |
| Data Entry     | Manual copy/paste from Spectrum | Direct entry with validation |
| Collaboration  | Single file, version conflicts  | Multi-user, real-time        |
| Reporting      | Manual refresh, print to PDF    | On-demand dashboards         |
| Data Integrity | Formula errors, broken refs     | Database constraints         |
| Accessibility  | Desktop only, file sharing      | Browser-based, anywhere      |

---

## 2. Scope Definition

### 2.1 In Scope (MVP)

| Feature              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| Project Setup        | Create/edit projects with contract amounts, GP targets, dates |
| Cost Code Management | Import and manage ~370 cost codes with categories             |
| Budget Management    | Enter original budget by cost code, track revisions           |
| Daily Time Entry     | Daily time tracking for crew members by cost code             |
| Actuals Entry        | Manual entry of labor hours/costs by cost code and month      |
| Labor Projections    | Create monthly labor forecasts with crew size planning        |
| Variance Analysis    | Budget vs Actual vs Forecast comparisons                      |
| Executive Summary    | One-page project health dashboard                             |
| Equipment Catalog    | Reference catalog of rental equipment and rates               |
| Employee Roster      | Manage list of crew members for time entry                    |
| User Authentication  | Secure login with Microsoft SSO and MFA                       |

### 2.2 Out of Scope (Future Phases)

- Spectrum system integration (automated import)
- Change Order workflow/approvals
- Mobile application
- Multi-project portfolio views
- Email notifications
- Audit trail / change history

---

## 3. Technical Architecture

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│                    (Browser - Any Device)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFRONT CDN                              │
│                    (Global Distribution)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         S3 BUCKET                                │
│                    (React Static Files)                          │
└─────────────────────────────────────────────────────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                                │
│                    (REST API Endpoints)                          │
│                    + Cognito Authorizer                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS LAMBDA                                  │
│                    (TypeScript/Node.js)                          │
│                    Business Logic Layer                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AURORA SERVERLESS v2                            │
│                    (PostgreSQL 16)                               │
│                    Scales to Zero                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer         | Technology                           | Justification                              |
| ------------- | ------------------------------------ | ------------------------------------------ |
| Frontend      | React 19.0 + TypeScript 5.7          | Latest stable, improved performance        |
| UI Components | shadcn/ui                            | Accessible, customizable, no external deps |
| Styling       | TailwindCSS 3.4                      | Rapid UI development, utility-first        |
| Build Tool    | Vite 6.0                             | Fast development builds                    |
| Auth Client   | AWS Amplify v6 (library)             | Simplifies Cognito integration             |
| Testing       | Vitest 2.1                           | Fast unit tests, Vite-native               |
| API           | AWS API Gateway                      | Managed, scalable, pay-per-request         |
| Compute       | AWS Lambda (Node.js 24 LTS)          | Serverless, no idle costs                  |
| Database      | Aurora Serverless v2 (PostgreSQL 16) | SQL flexibility, scales to zero            |
| DB Pooling    | AWS RDS Proxy                        | Managed connection pooling for Lambda      |
| Observability | Lambda Powertools (TS)               | Structured logging, tracing, metrics       |
| Auth          | AWS Cognito                          | Managed user pools, secure                 |
| CDN           | CloudFront                           | Global edge caching                        |
| Storage       | S3                                   | Static asset hosting                       |
| IaC           | AWS CDK v2                           | Infrastructure as code                     |

### 3.3 Why Serverless?

- **Cost Efficiency:** Pay only for actual usage, scales to zero during off-hours
- **Scalability:** Automatically handles traffic spikes
- **Maintenance:** No server patching or capacity planning
- **Security:** AWS manages infrastructure security

### 3.4 Technology Evaluation Summary

The following alternatives were evaluated before finalizing the stack. Decisions are documented here for future reference.

#### Backend Runtime: Node.js/TypeScript vs Java/Spring

| Criteria             | Node.js 24 (chosen)           | Java 21 + Spring Boot                             |
| -------------------- | ----------------------------- | ------------------------------------------------- |
| Lambda cold start    | 200-500ms                     | 5-10s (2-3s with SnapStart)                       |
| Memory requirement   | 256-512MB                     | 512MB-1GB minimum                                 |
| Language consistency | Same as frontend (TypeScript) | Separate language from frontend                   |
| Framework overhead   | Minimal (no framework)        | Heavy (DI container, auto-config, component scan) |
| Team size fit        | Small team, fast iteration    | Better for large teams with Java expertise        |

**Decision:** Node.js/TypeScript. Cold starts are unacceptable with Spring Boot on Lambda for an internal app with low traffic (containers cool down frequently). SnapStart mitigates but adds constraints (no ARM64, no provisioned concurrency). The Handler → Service → Repository pattern provides the same clean architecture as Spring MVC without the framework overhead.

#### Frontend Framework: React vs Angular vs Vue vs Svelte

| Criteria             | React (chosen)        | Angular                  | Vue 3      | Svelte 5                 |
| -------------------- | --------------------- | ------------------------ | ---------- | ------------------------ |
| AWS Amplify support  | First-class           | Good                     | Good       | Limited                  |
| UI component library | shadcn/ui (excellent) | Angular Material         | Vuetify    | shadcn-svelte (immature) |
| Learning curve       | Medium                | High (RxJS, DI, modules) | Low-Medium | Low                      |
| Talent availability  | Very high             | High                     | Medium     | Low                      |
| Bundle size (gzip)   | ~45KB                 | ~65KB                    | ~33KB      | ~2KB                     |

**Decision:** React. Primary driver is first-class AWS Amplify support and shadcn/ui as the component library. Angular's RxJS complexity is unnecessary for this app. Vue and Svelte have smaller ecosystems and less Amplify integration.

#### Frontend Framework: React vs Next.js

| Criteria              | React SPA (chosen)                        | Next.js                                                  |
| --------------------- | ----------------------------------------- | -------------------------------------------------------- |
| Hosting               | S3 + CloudFront ($5-20/mo)                | Vercel ($20-100+/mo) or complex AWS setup (OpenNext/SST) |
| SSR/SEO needed        | No (internal app, authenticated)          | No                                                       |
| Deploy complexity     | `aws s3 sync` — static files              | Server runtime, caching, ISR, middleware                 |
| Cold starts           | Backend only (Lambda)                     | Frontend SSR also has cold starts on Lambda              |
| Architecture coupling | Frontend and backend deploy independently | Full-stack deploys are coupled                           |

**Decision:** React SPA. This is an internal authenticated app — SSR and SEO provide no value. S3 + CloudFront hosting is simpler, cheaper, and has zero frontend cold starts.

#### Frontend: React vs Vanilla JS/TypeScript

**Decision:** React. The app has 8+ screens with editable tables, complex forms, authentication, role-based permissions, and shared state (selected project). Without React, we would need to build a rendering system, state management, router, and XSS sanitization from scratch — effectively reinventing React with more bugs.

#### CSS Framework: Tailwind CSS vs Bootstrap vs CSS Modules

| Criteria          | Tailwind + shadcn/ui (chosen) | Bootstrap + React Bootstrap       | CSS Modules        |
| ----------------- | ----------------------------- | --------------------------------- | ------------------ |
| Component library | shadcn/ui (requires Tailwind) | React Bootstrap                   | Build from scratch |
| Customization     | Full — own the component code | Limited — SCSS variable overrides | Full but manual    |
| Bundle size       | ~10KB (only used classes)     | ~40KB (CSS + JS)                  | Varies             |
| Look & feel       | Modern, unique                | Generic "Bootstrap look"          | Custom             |
| CSS conflicts     | None (atomic utility classes) | Common (specificity issues)       | Scoped but verbose |

**Decision:** Tailwind CSS. Required by shadcn/ui, which provides accessible, customizable components. Bootstrap would force a different component library with less flexibility and a dated appearance.

#### Infrastructure as Code: AWS CDK vs Terraform vs SAM

| Criteria                                    | AWS CDK (chosen)                                     | Terraform                  | SAM                              |
| ------------------------------------------- | ---------------------------------------------------- | -------------------------- | -------------------------------- |
| Language                                    | TypeScript (same as app)                             | HCL (new language)         | YAML                             |
| Abstraction level                           | High (L2/L3 constructs)                              | Low (resource by resource) | High for Lambda only             |
| Complex resources (VPC, RDS Proxy, Cognito) | Built-in constructs                                  | Manual policy/config       | Falls back to raw CloudFormation |
| Permission management                       | `grantRead()`, `grantConnect()` — auto-generates IAM | Manual IAM policy JSON     | Manual IAM policy JSON           |
| Multi-cloud                                 | AWS only                                             | AWS, GCP, Azure            | AWS only                         |
| Rollback                                    | CloudFormation auto-rollback                         | Manual                     | CloudFormation auto-rollback     |

**Decision:** AWS CDK. Single language across the entire stack (TypeScript). High-level constructs dramatically reduce boilerplate for VPC, RDS Proxy, Cognito, and IAM permissions. SAM only simplifies Lambda + API Gateway — everything else requires raw CloudFormation. Terraform's multi-cloud capability is unnecessary since we are AWS-only.

---

## 4. Data Model

### 4.1 Entity Relationship Diagram

```
                                    ┌──────────────────┐
                                    │      USERS       │
                                    ├──────────────────┤
                                    │ id (PK)          │
                                    │ email            │
                                    │ name             │
                                    │ role             │
                                    │ cognito_sub      │
                                    │ is_active        │
                                    └──────────────────┘
                                             │
                                             │ created_by
                                             ▼
┌───────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│   LABOR_RATES     │              │    COST_CODES    │              │ EQUIPMENT_CATALOG│
├───────────────────┤              ├──────────────────┤              ├──────────────────┤
│ id (PK)           │              │ id (PK)          │              │ id (PK)          │
│ classification    │              │ code             │              │ vendor           │
│ base_rate         │              │ description      │              │ description      │
│ burden_pct        │              │ cost_type        │              │ category         │
│ burdened_rate     │              │ category         │              │ daily_rate       │
└───────────────────┘              │ active           │              │ weekly_rate      │
         ▲                         └──────────────────┘              │ monthly_rate     │
         │                                  ▲                        └──────────────────┘
         │                                  │
         │         ┌────────────────────────┼────────────────────────┐
         │         │                        │                        │
         │         │                        │                        │
┌────────┴─────────┴───┐         ┌─────────┴────────┐      ┌────────┴─────────┐
│      PROJECTS        │         │   BUDGET_LINES   │      │     ACTUALS      │
├──────────────────────┤         ├──────────────────┤      ├──────────────────┤
│ id (PK)              │◄───────┐│ id (PK)          │      │ id (PK)          │
│ name                 │        ││ project_id (FK)  │──────│ project_id (FK)  │
│ job_number           │        ││ cost_code_id(FK) │      │ cost_code_id(FK) │
│ contract_amt         │        ││ budget_hours     │      │ month            │
│ budgeted_gp_pct      │        ││ budget_dollars   │      │ hours_reg        │
│ start_date           │        ││ revised_hours    │      │ hours_ot         │
│ end_date             │        ││ revised_dollars  │      │ hours_dt         │
│ labor_rate_id (FK)───┼────────┘│ notes            │      │ hours_total      │
│ burden_pct           │         └──────────────────┘      │ cost_labor       │
│ status               │                                   │ cost_other       │
└──────────────────────┘                                   │ cost_total       │
         │                                                 └──────────────────┘
         │
         ├─────────────────────────────────────────────────────────┐
         │                                                         │
         ▼                                                         ▼
┌──────────────────────┐                              ┌──────────────────────┐
│ PROJECTION_SNAPSHOTS │                              │     EMPLOYEES        │
├──────────────────────┤                              ├──────────────────────┤
│ id (PK)              │                              │ id (PK)              │
│ project_id (FK)      │                              │ project_id (FK)      │
│ snapshot_date        │                              │ employee_number      │
│ snapshot_label       │                              │ first_name           │
│ forecast_hours       │                              │ last_name            │
│ forecast_cost        │                              │ classification       │
│ is_current           │                              │ labor_rate_id (FK)───┼──► LABOR_RATES
│ created_by (FK)      │──► USERS                     │ home_branch          │
└──────────────────────┘                              │ is_active            │
         │                                            │ project_role         │
         │                                            │ start_date           │
         ▼                                            │ end_date             │
┌──────────────────────┐                              │ notes                │
│ PROJECTION_DETAILS   │                              └──────────────────────┘
├──────────────────────┤                                        │
│ id (PK)              │                                        │
│ snapshot_id (FK)     │                                        │
│ cost_code_id (FK)────┼──► COST_CODES                          │
│ month                │                                        │
│ crew_size            │                                        ▼
│ hours_per_week       │                              ┌──────────────────────┐
│ weeks_in_month       │                              │  DAILY_TIME_ENTRIES  │
│ projected_hours      │                              ├──────────────────────┤
│ projected_cost       │                              │ id (PK)              │
└──────────────────────┘                              │ project_id (FK)──────┼──► PROJECTS
                                                      │ employee_id (FK)     │
                                                      │ cost_code_id (FK)────┼──► COST_CODES
                                                      │ work_date            │
                                                      │ hours_reg            │
                                                      │ hours_ot             │
                                                      │ hours_dt             │
                                                      │ labor_cost           │
                                                      │ source               │
                                                      │ notes                │
                                                      │ created_by (FK)──────┼──► USERS
                                                      │ created_at           │
                                                      └──────────────────────┘
```

### 4.2 Relationships Summary

| Parent               | Child                | Relationship | Description                                   |
| -------------------- | -------------------- | ------------ | --------------------------------------------- |
| PROJECTS             | BUDGET_LINES         | 1:N          | A project has many budget lines               |
| PROJECTS             | ACTUALS              | 1:N          | A project has many actual entries             |
| PROJECTS             | PROJECTION_SNAPSHOTS | 1:N          | A project has many projection snapshots       |
| PROJECTS             | EMPLOYEES            | 1:N          | A project has many assigned employees         |
| PROJECTS             | DAILY_TIME_ENTRIES   | 1:N          | A project has many time entries               |
| LABOR_RATES          | PROJECTS             | 1:N          | A labor rate can be default for many projects |
| LABOR_RATES          | EMPLOYEES            | 1:N          | A labor rate applies to many employees        |
| COST_CODES           | BUDGET_LINES         | 1:N          | A cost code appears in many budget lines      |
| COST_CODES           | ACTUALS              | 1:N          | A cost code appears in many actuals           |
| COST_CODES           | PROJECTION_DETAILS   | 1:N          | A cost code appears in many projections       |
| COST_CODES           | DAILY_TIME_ENTRIES   | 1:N          | A cost code appears in many time entries      |
| PROJECTION_SNAPSHOTS | PROJECTION_DETAILS   | 1:N          | A snapshot has many detail lines              |
| EMPLOYEES            | DAILY_TIME_ENTRIES   | 1:N          | An employee has many time entries             |
| USERS                | DAILY_TIME_ENTRIES   | 1:N          | A user creates many time entries              |
| USERS                | PROJECTION_SNAPSHOTS | 1:N          | A user creates many snapshots                 |

### 4.3 Table Descriptions

| Table                | Description                                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| USERS                | Application users authenticated via Cognito. Stores role (Admin/PM/Viewer) and links to Cognito user pool via cognito_sub.                                                                                                                                  |
| PROJECTS             | Main entity representing a construction project. Stores contract value, target GP%, dates, burden percentage, and status (Active/Completed). Links to a default labor rate.                                                                                 |
| COST_CODES           | Reference table with ~370 standardized codes for categorizing costs. Each code has a type (L/M/E/S/F/O) and category. Shared across all projects.                                                                                                           |
| LABOR_RATES          | Reference table with labor classifications (Journeyman, Apprentice, Foreman, App 0/1/2/3, etc.) and their hourly rates. Includes base rate, burden %, and calculated burdened rate.                                                                         |
| BUDGET_LINES         | Stores the original and revised budget for each cost code within a project. Contains both hours (for labor) and dollar amounts. One record per project-cost code combination.                                                                               |
| ACTUALS              | Records actual costs incurred by month and cost code. Tracks Regular, Overtime, and Double Time hours separately. Separates labor cost from other costs for accurate reporting. Aggregated from DAILY_TIME_ENTRIES or entered manually for non-labor costs. |
| PROJECTION_SNAPSHOTS | Header table for projection snapshots. Each snapshot captures the forecast at a point in time (e.g., "12.29.25 Remaining Labor Est"). Allows historical comparison of forecasts.                                                                            |
| PROJECTION_DETAILS   | Line items for each snapshot. Stores monthly crew planning (crew size, hours/week, weeks) and calculated projections by cost code.                                                                                                                          |
| EMPLOYEES            | Roster of crew members assigned to the project. Includes classification, home branch, project role, and assignment dates. Mirrors structure from Spectrum ERP for future integration.                                                                       |
| DAILY_TIME_ENTRIES   | Daily time records for each employee by cost code. Tracks REG/OT/DT hours and calculated labor cost. Source field indicates 'MANUAL' (MVP) or 'SPECTRUM' (future import).                                                                                   |
| EQUIPMENT_CATALOG    | Reference table with rental equipment from vendors (Sunbelt, United, etc.). Contains daily, weekly, and monthly rates. Used for estimating equipment costs.                                                                                                 |

### 4.4 Cost Types Reference

| Code | Description        | Examples                   |
| ---- | ------------------ | -------------------------- |
| E    | Equipment Rental   | Boom lifts, forklifts      |
| F    | Project Management | PM, estimating, purchasing |
| L    | Labor              | Field work, installation   |
| M    | Materials          | Wire, conduit, fixtures    |
| O    | Other              | Miscellaneous costs        |
| S    | Subcontractors     | Third-party work           |

---

## 5. Feature Specifications

### 5.1 Business Calculations Reference

The following formulas are extracted from the current Excel system (`projections.xlsm`) and must be replicated in the web application:

#### Gross Profit (GP) Calculations

```
Budgeted GP% = 1 - (Total Budgeted Cost / Contract Amount)
Current GP% = 1 - (Forecast At Completion Cost / Contract Amount)
GP Variance ($) = (Current GP% - Budgeted GP%) × Contract Amount
```

#### Cost Calculations

```
Total Budgeted Cost = SUM(Budget by Cost Type: L + M + E + S + F + O)
Forecast At Completion = JTD Actuals + Remaining Forecast
Variance ($) = Budgeted Cost - Forecast At Completion
Variance (%) = Variance ($) / Budgeted Cost
```

#### Labor Calculations

```
Total Labor Hours = SUMIF(CostType = "L", Hours)
JTD Labor Hours = SUMIF(CostType = "L", Actual Hours)
Remaining Labor Hours = Total Projected Hours - JTD Hours
Labor Cost = Hours × Burdened Labor Rate
Burdened Rate = Base Rate × (1 + Burden %)
```

#### Actuals Aggregation

```
Hours Regular = SUMIFS(Hours WHERE PayType = "REG")
Hours Overtime = SUMIFS(Hours WHERE PayType = "OT")
Hours Double Time = SUMIFS(Hours WHERE PayType = "DT")
Total Hours = Hours Reg + Hours OT + Hours DT
Total Cost = SUMIFS(TotalLaborCost by Month, Job, CostCode)
```

#### Projection Calculations

```
Monthly Projected Hours = Crew Size × Hours/Person/Week × Weeks in Month
Monthly Projected Cost = Projected Hours × Labor Rate
Remaining Cost = Remaining Hours × Labor Rate
Forecast At Completion Hours = JTD Hours + Remaining Hours
Forecast At Completion Cost = JTD Cost + Remaining Cost
```

#### Monthly Summary (per cost code)

```
Budget This Month = SUMPRODUCT(Budget WHERE Month <= Current)
Forecast This Month = XLOOKUP(Month, ForecastDollars)
Actual This Month = SUMIFS(Actuals WHERE Month = Current)
Variance = Actual - Forecast
```

#### Crew Size Estimation (reverse calculation)

```
Weeks Remaining = (Project End - Current Date) / 7
Crew Size Needed = (Remaining Hours / 40) / Weeks Remaining
```

---

### 5.2 Project Dashboard

**Purpose:** Central view of project financial health

**Display Elements:**

- Project header (name, job number, dates)
- Contract summary (original, approved COs, total)
- GP metrics (budgeted vs current vs projected)
- Cost breakdown by type (E/F/L/M/O/S)
- Hours summary (budgeted, JTD, remaining)

---

### 5.3 Budget Entry Screen

**Purpose:** Enter and revise budget by cost code

**Fields:**

- Cost Code (dropdown with search)
- Cost Type (auto-populated from cost code)
- Description (auto-populated)
- Original Budget Hours
- Original Budget Dollars
- Revised Budget Hours (editable)
- Revised Budget Dollars (editable)
- Notes

**Validation:**

- Budget dollars should align with hours × labor rate (warning if >10% variance)
- Cannot enter negative values

### 5.4 Actuals Entry Screen

**Purpose:** Record actual costs incurred

**Fields:**

- Month (dropdown)
- Cost Code (dropdown with search)
- Regular Hours
- Overtime Hours
- Total Cost
- Notes

**Features:**

- Bulk entry mode for multiple cost codes
- Copy from previous month option
- Running totals display

### 5.5 Labor Projection Screen

**Purpose:** Forecast remaining labor by month

**Fields:**

- Month
- Crew Size (number of workers)
- Hours per Person per Week
- Working Weeks in Month
- Calculated Total Hours
- Calculated Total Cost (hours × labor rate)

**Features:**

- Visual timeline of projected vs actual
- Ability to create snapshots for comparison

### 5.6 Executive Summary Report

**Purpose:** One-page printable project status

**Sections:**

- Project identification
- Key metrics table (budget, forecast, actual, variance)
- Month-over-month trend
- Top 5 cost drivers
- Notes/risks section

**Export:** PDF generation

---

## 6. User Flow & Roles

### 6.1 User Flow Diagram

```
                         ┌─────────────┐
                         │    Login    │
                         │ (SSO/Email) │
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  MFA Check  │ (if enabled)
                         └──────┬──────┘
                                │
                                ▼
                         ┌─────────────┐
                         │   Project   │
                         │  Selection  │
                         └──────┬──────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           MAIN APPLICATION                                 │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Navigation Tabs:                                                         │
│  ┌─────────┬────────┬───────────┬──────────┬─────────┬─────────┬───────┐ │
│  │Dashboard│ Budget │ Employees │Time Entry│ Actuals │  Proj.  │Reports│ │
│  └─────────┴────────┴───────────┴──────────┴─────────┴─────────┴───────┘ │
│       │                              │           ▲                  │     │
│       │                              │           │                  │     │
│       │                              ▼           │                  ▼     │
│       │                        ┌──────────┐     │           ┌──────────┐ │
│       │                        │  Daily   │─────┘           │Executive │ │
│       │                        │  Hours   │  Aggregates     │ Summary  │ │
│       │                        └──────────┘  to Monthly     │  (PDF)   │ │
│       │                                                     └──────────┘ │
│       │                                                                   │
│       └──────────────────────────────────────────────────────────────────┘
│                                    │
│  Secondary Navigation (Setup menu):│
│  ┌─────────────────────────────────┼─────────────────────────────────┐   │
│  │ Users │ Cost Codes │ Labor Rates │ Equipment Catalog │ Project    │   │
│  └───────┴────────────┴─────────────┴───────────────────┴────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Budget    │      │  Time Entry  │      │   Actuals    │      │  Projections │
│   (Plan)     │      │   (Daily)    │      │  (Monthly)   │      │  (Forecast)  │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │                     │
       │                     │   Aggregate         │                     │
       │                     └────────────────────►│                     │
       │                                           │                     │
       └───────────────────────────────────────────┼─────────────────────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │   Dashboard   │
                                          │  & Reports    │
                                          │               │
                                          │ • Variance    │
                                          │ • GP %        │
                                          │ • Trends      │
                                          └───────────────┘
```

### 6.3 User Roles & Permissions

| Permission               | Admin | Project Manager | Viewer |
| ------------------------ | :---: | :-------------: | :----: |
| **Projects**             |
| Create/Delete Projects   |   ✓   |        ✗        |   ✗    |
| Edit Project Settings    |   ✓   |        ✓        |   ✗    |
| View Projects            |   ✓   |        ✓        |   ✓    |
| **Employees**            |
| Add/Edit Employees       |   ✓   |        ✓        |   ✗    |
| View Employee Roster     |   ✓   |        ✓        |   ✓    |
| **Time Entry**           |
| Enter/Edit Daily Time    |   ✓   |        ✓        |   ✗    |
| View Time Entries        |   ✓   |        ✓        |   ✓    |
| **Budget**               |
| Create/Edit Budget       |   ✓   |        ✓        |   ✗    |
| View Budget              |   ✓   |        ✓        |   ✓    |
| **Actuals**              |
| Enter/Edit Actuals       |   ✓   |        ✓        |   ✗    |
| View Actuals             |   ✓   |        ✓        |   ✓    |
| **Projections**          |
| Create/Edit Projections  |   ✓   |        ✓        |   ✗    |
| View Projections         |   ✓   |        ✓        |   ✓    |
| **Reports**              |
| View Dashboard           |   ✓   |        ✓        |   ✓    |
| Export PDF Reports       |   ✓   |        ✓        |   ✓    |
| **Administration**       |
| Manage Users             |   ✓   |        ✗        |   ✗    |
| Manage Cost Codes        |   ✓   |        ✗        |   ✗    |
| Manage Equipment Catalog |   ✓   |        ✗        |   ✗    |

### 6.4 Role Descriptions

| Role            | Description                                                            | Typical User                          |
| --------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| Admin           | Full system access, manages users and reference data                   | System administrator, Owner           |
| Project Manager | Can manage all project data but cannot create projects or manage users | PM, Estimator, Project Engineer       |
| Viewer          | Read-only access to all project data and reports                       | Executives, Stakeholders, Accountants |

---

## 7. User Interface Mockups

### 7.1 Main Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Login Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │      [Logo]         │                       │
│                    │  Project Cost       │                       │
│                    │     Control         │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │                     │                       │
│                    │ [🪟 Sign in with   ]│                       │
│                    │ [   Microsoft      ]│                       │
│                    │                     │                       │
│                    │ ─────── or ──────── │                       │
│                    │                     │                       │
│                    │ Email               │                       │
│                    │ ┌─────────────────┐ │                       │
│                    │ │                 │ │                       │
│                    │ └─────────────────┘ │                       │
│                    │                     │                       │
│                    │ Password            │                       │
│                    │ ┌─────────────────┐ │                       │
│                    │ │ ●●●●●●●●        │ │                       │
│                    │ └─────────────────┘ │                       │
│                    │                     │                       │
│                    │ [    Sign In     ]  │                       │
│                    │                     │                       │
│                    │ Forgot password?    │                       │
│                    └─────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 MFA Verification Screen (when enabled)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │      [Logo]         │                       │
│                    │  Project Cost       │                       │
│                    │     Control         │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │                     │                       │
│                    │ Two-Factor Auth     │                       │
│                    │                     │                       │
│                    │ Enter the 6-digit   │                       │
│                    │ code from your      │                       │
│                    │ authenticator app   │                       │
│                    │                     │                       │
│                    │ ┌──┬──┬──┬──┬──┬──┐ │                       │
│                    │ │  │  │  │  │  │  │ │                       │
│                    │ └──┴──┴──┴──┴──┴──┘ │                       │
│                    │                     │                       │
│                    │ [    Verify      ]  │                       │
│                    │                     │                       │
│                    │ Use backup code     │                       │
│                    └─────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Project Selection Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control                              [👤]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Select a Project                              [+ New Project]   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔍 Search projects...                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Citizens Medical Center                                  │    │
│  │ 23CON0002 │ $15.19M │ GP: 14.4% │ Active                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Downtown Office Tower                                    │    │
│  │ 24CON0015 │ $8.5M │ GP: 22.1% │ Active                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Airport Terminal Expansion                               │    │
│  │ 22CON0089 │ $32.4M │ GP: 18.7% │ Completed              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├─────────────────────────────────────────────────────────────────┤
│  Citizens Medical Center (23CON0002)           As of: 12/11/25  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Contract    │  │ Budgeted GP │  │ Current GP  │              │
│  │ $15.19M     │  │ 31.5%       │  │ 14.4%  ▼    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  Cost Breakdown by Type                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ L - Labor        ████████████████████████  $4.9M (38%)  │    │
│  │ O - Other        ████████████████          $4.1M (32%)  │    │
│  │ M - Materials    ████████                  $1.6M (12%)  │    │
│  │ S - Subcontract  ██████                    $1.4M (11%)  │    │
│  │ F - PM           ███                       $0.6M (5%)   │    │
│  │ E - Equipment    █                         $0.3M (2%)   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Hours Summary                                                   │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐   │
│  │ Budgeted     │ JTD          │ Remaining    │ Projected   │   │
│  │ 45,822       │ 87,896       │ 2,156        │ 98,135      │   │
│  └──────────────┴──────────────┴──────────────┴─────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Budget Entry Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├─────────────────────────────────────────────────────────────────┤
│  Budget Entry                                    [+ Add Line]   │
│                                                                  │
│  Filter: [All Types ▼]  🔍 Search cost codes...                 │
│                                                                  │
│  ┌───────┬────────────────────┬──────┬──────────┬──────────┬───┐│
│  │ Code  │ Description        │ Type │ Orig Hrs │ Orig $   │   ││
│  ├───────┼────────────────────┼──────┼──────────┼──────────┼───┤│
│  │ 01100 │ Project Manager    │  F   │    2,080 │  $187,200│ ✎ ││
│  │ 01200 │ Superintendent     │  F   │    2,080 │  $166,400│ ✎ ││
│  │ 01300 │ General Foreman    │  L   │    4,160 │  $291,200│ ✎ ││
│  │ 02100 │ Journeyman Elec.   │  L   │   18,720 │$1,122,000│ ✎ ││
│  │ 02200 │ Apprentice Elec.   │  L   │   12,480 │  $499,200│ ✎ ││
│  │ 03100 │ Wire & Cable       │  M   │        - │  $892,000│ ✎ ││
│  │ 03200 │ Conduit & Fittings │  M   │        - │  $445,000│ ✎ ││
│  │ ...   │ ...                │ ...  │      ... │      ... │   ││
│  └───────┴────────────────────┴──────┴──────────┴──────────┴───┘│
│                                                                  │
│  Totals:                              37,520 hrs   $3,603,000   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.7 Daily Time Entry Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Time Entry │ Actuals │ Projections │ ... │
├─────────────────────────────────────────────────────────────────┤
│  Daily Time Entry (Manual)                    Source: MANUAL    │
│                                                                  │
│  Week of: [Jan 13, 2026 ▼]     Cost Code: [02100 - Journeyman ▼]│
│                                                                  │
│  ┌────────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬───────┐
│  │ Employee       │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │ Total │
│  ├────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼───────┤
│  │ John Smith     │  8  │  8  │  8  │  8  │  8  │  4  │  -  │  44   │
│  │ Mike Johnson   │  8  │  8  │  8  │  8  │  8  │  -  │  -  │  40   │
│  │ Carlos Garcia  │  8  │  8  │  8  │  8  │  10 │  6  │  -  │  48   │
│  │ David Lee      │  8  │  8  │  8  │  8  │  8  │  -  │  -  │  40   │
│  │ James Wilson   │  8  │  8  │  -  │  8  │  8  │  4  │  -  │  36   │
│  │ + Add Employee │     │     │     │     │     │     │     │       │
│  └────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴───────┘
│                                                                  │
│  Week Total: 208 hrs (REG: 192, OT: 16)         Est Cost: $14,560│
│                                                                  │
│  [Cancel]                                              [Save]    │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Grid entry by employee and day
- Auto-calculate OT (hours > 8/day or > 40/week)
- Quick copy from previous week
- Filter by cost code or show all
- Running totals and estimated cost (hours × employee's burdened rate)
- Source field = 'MANUAL' (future: 'SPECTRUM' when ERP integration available)

**Note:** This manual entry replaces Spectrum ERP import until integration is available. Data structure is compatible with future Spectrum import (JobNumber, EmployeeID, CostCode, Hours, PayType, LaborCost).

### 7.8 Employee Roster Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Time Entry │ Actuals │ Projections │ ... │
├─────────────────────────────────────────────────────────────────┤
│  Employee Roster                                [+ Add Employee] │
│                                                                  │
│  Filter: [All Classifications ▼]  🔍 Search employees...        │
│                                                                  │
│  ┌────────┬────────────────┬───────────────┬──────────┬────────┐│
│  │ ID     │ Name           │ Classification│ Rate/Hr  │ Status ││
│  ├────────┼────────────────┼───────────────┼──────────┼────────┤│
│  │ E001   │ John Smith     │ Journeyman    │   $70.00 │ Active ││
│  │ E002   │ Mike Johnson   │ Journeyman    │   $70.00 │ Active ││
│  │ E003   │ Carlos Garcia  │ Foreman       │   $85.00 │ Active ││
│  │ E004   │ David Lee      │ Apprentice 3  │   $45.00 │ Active ││
│  │ E005   │ James Wilson   │ Apprentice 2  │   $38.00 │ Active ││
│  │ E006   │ Tom Brown      │ Journeyman    │   $70.00 │Inactive││
│  └────────┴────────────────┴───────────────┴──────────┴────────┘│
│                                                                  │
│  6 employees (5 active)                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.9 Actuals Entry Screen (Monthly Summary)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Time Entry │ Actuals │ Projections │ ... │
├─────────────────────────────────────────────────────────────────┤
│  Monthly Actuals Summary                                         │
│                                                                  │
│  Month: [January 2026 ▼]   [Sync from Time Entries] [+ Manual]  │
│                                                                  │
│  ┌───────┬────────────────────┬──────┬────────┬────────┬───────┐│
│  │ Code  │ Description        │ Type │ Reg Hrs│ OT Hrs │ Cost  ││
│  ├───────┼────────────────────┼──────┼────────┼────────┼───────┤│
│  │ 01100 │ Project Manager    │  F   │    176 │      8 │$16,560││
│  │ 01200 │ Superintendent     │  F   │    176 │     16 │$15,360││
│  │ 01300 │ General Foreman    │  L   │    352 │     24 │$26,320││
│  │ 02100 │ Journeyman Elec.   │  L   │  1,408 │    112 │$91,200││
│  │ 02200 │ Apprentice Elec.   │  L   │    880 │     64 │$37,760││
│  │ 03100 │ Wire & Cable       │  M   │      - │      - │$45,200││
│  │ ...   │ ...                │ ...  │    ... │    ... │   ... ││
│  └───────┴────────────────────┴──────┴────────┴────────┴───────┘│
│                                                                  │
│  Month Totals:                         2,992 hrs  224 hrs  $232K│
│  JTD Totals:                          85,280 hrs 2,616 hrs $4.2M│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Note:** Monthly actuals can be populated from Daily Time Entries (aggregated) or entered manually for non-labor costs (materials, equipment, subcontractors).

### 7.10 Labor Projections Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├─────────────────────────────────────────────────────────────────┤
│  Labor Projections                          [Save Snapshot]     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Timeline View                                           │    │
│  │  ═══════════════●═══════════════════════════════════     │    │
│  │  Oct    Nov    Dec    Jan    Feb    Mar    Apr    May    │    │
│  │  Actual ████████ │ Projected ░░░░░░░░░░░░░░░░░░░░░░░░   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌───────┬──────┬───────────┬───────┬───────────┬──────────┐   │
│  │ Month │ Crew │ Hrs/Person│ Weeks │ Total Hrs │ Est Cost │   │
│  ├───────┼──────┼───────────┼───────┼───────────┼──────────┤   │
│  │ Jan 26│   12 │        40 │   4.0 │     1,920 │  $134,400│   │
│  │ Feb 26│   10 │        40 │   4.0 │     1,600 │  $112,000│   │
│  │ Mar 26│    8 │        40 │   4.5 │     1,440 │  $100,800│   │
│  │ Apr 26│    4 │        40 │   4.0 │       640 │   $44,800│   │
│  │ May 26│    2 │        40 │   2.0 │       160 │   $11,200│   │
│  └───────┴──────┴───────────┴───────┴───────────┴──────────┘   │
│                                                                  │
│  Projected Remaining:                    5,760 hrs    $403,200  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.11 Reports Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├─────────────────────────────────────────────────────────────────┤
│  Reports                                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📄 Executive Summary                                     │    │
│  │    One-page project health overview                      │    │
│  │    [Preview]  [Export PDF]                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📊 Budget vs Actual Report                               │    │
│  │    Detailed variance analysis by cost code               │    │
│  │    [Preview]  [Export PDF]                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📈 Monthly Trend Report                                  │    │
│  │    Cost and hours trends over time                       │    │
│  │    [Preview]  [Export PDF]                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🕐 Projection History                                    │    │
│  │    Compare snapshots over time                           │    │
│  │    [Preview]  [Export PDF]                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.12 Equipment Catalog Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├─────────────────────────────────────────────────────────────────┤
│  Equipment Catalog                           [+ Add Equipment]  │
│                                                                  │
│  Filter: [All Categories ▼]  🔍 Search equipment...             │
│                                                                  │
│  ┌────────────────────┬──────────┬────────┬────────┬──────────┐│
│  │ Description        │ Vendor   │ Daily  │ Weekly │ Monthly  ││
│  ├────────────────────┼──────────┼────────┼────────┼──────────┤│
│  │ Boom Lift 40'      │ Sunbelt  │   $185 │   $520 │   $1,450 ││
│  │ Boom Lift 60'      │ Sunbelt  │   $275 │   $780 │   $2,100 ││
│  │ Scissor Lift 26'   │ United   │    $95 │   $285 │     $750 ││
│  │ Forklift 5K        │ Sunbelt  │   $125 │   $375 │     $950 ││
│  │ Telehandler 8K     │ United   │   $295 │   $885 │   $2,400 ││
│  │ Generator 20KW     │ Sunbelt  │    $85 │   $255 │     $680 ││
│  │ ...                │ ...      │    ... │    ... │      ... ││
│  └────────────────────┴──────────┴────────┴────────┴──────────┘│
│                                                                  │
│  450 items                                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.13 Setup Screen (Admin Only)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] Project Cost Control          [Project Selector ▼] [👤] │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Budget │ Actuals │ Projections │ Reports │ Setup  │
├──────────────────────────────��──────────────────────────────────┤
│  Setup                                                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 👥 User Management                                       │    │
│  │    Add, edit, and manage user accounts and roles         │    │
│  │    [Manage Users →]                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🏷️ Cost Codes                                            │    │
│  │    Manage cost code library (370 codes)                  │    │
│  │    [Manage Cost Codes →]                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 💰 Labor Rates                                           │    │
│  │    Configure labor classifications and rates             │    │
│  │    [Manage Labor Rates →]                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📋 Project Settings                                      │    │
│  │    Edit current project details                          │    │
│  │    [Edit Project →]                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Timeline

### Week 1: Foundation

| Day | Tasks                                                                                  |
| --- | -------------------------------------------------------------------------------------- |
| 1-2 | CDK infrastructure setup (Aurora, Lambda, API Gateway, Cognito)                        |
| 3   | Cognito setup: Microsoft SSO federation (Azure AD), MFA configuration                  |
| 4   | Database schema creation, seed data import (cost codes, labor rates)                   |
| 5   | React + Vite + TypeScript setup, TailwindCSS config, shadcn/ui install, Amplify config |

**Deliverable:** Working infrastructure, frontend skeleton ready

### Week 2: Auth & Core Setup

| Day | Tasks                                                           |
| --- | --------------------------------------------------------------- |
| 1   | Authentication flow (SSO + email/password + MFA), login screens |
| 2   | Project CRUD, Employee Roster management                        |
| 3-4 | Budget entry screen with cost code lookup                       |
| 5   | Daily Time Entry screen (weekly grid view)                      |

**Deliverable:** User can log in, create project, manage employees, enter budget and daily time

### Week 3: Actuals & Projections

| Day | Tasks                                                           |
| --- | --------------------------------------------------------------- |
| 1   | Monthly Actuals summary (aggregate from daily entries + manual) |
| 2-3 | Labor projection entry screen with snapshots                    |
| 4-5 | Variance calculations (budget vs actual vs forecast), Dashboard |

**Deliverable:** User can see monthly actuals, create projections, view variances

### Week 4: Reporting & Polish

| Day | Tasks                                     |
| --- | ----------------------------------------- |
| 1-2 | Executive summary report with PDF export  |
| 3   | Equipment catalog reference screen        |
| 4   | UI polish, error handling, loading states |
| 5   | Testing, bug fixes, deployment            |

**Deliverable:** Production-ready MVP

---

## 9. Estimated Costs

### 8.1 AWS Monthly Costs (MVP Usage)

| Service              | Estimated Cost   | Notes                     |
| -------------------- | ---------------- | ------------------------- |
| Aurora Serverless v2 | $15-30           | Scales to 0.5 ACU minimum |
| RDS Proxy            | $10-20           | ~$0.015/hr per vCPU       |
| Lambda               | $0-5             | First 1M requests free    |
| API Gateway          | $0-5             | First 1M requests free    |
| S3 + CloudFront      | $1-5             | Static hosting            |
| Cognito              | $0               | First 50K MAU free        |
| **Total**            | **$30-65/month** |                           |

### 8.2 Cost at Scale (100 Users)

| Service              | Estimated Cost    |
| -------------------- | ----------------- |
| Aurora Serverless v2 | $50-100           |
| RDS Proxy            | $20-40            |
| Lambda               | $10-20            |
| API Gateway          | $10-20            |
| S3 + CloudFront      | $5-10             |
| Cognito              | $0                |
| **Total**            | **$95-190/month** |

---

## 10. Security Considerations

### 10.1 Authentication

| Method         | Description                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microsoft SSO  | Primary login method via Azure AD federation. Users click "Sign in with Microsoft" and authenticate with corporate credentials.                   |
| Email/Password | Alternative login for users without Microsoft accounts. Passwords stored with Cognito (bcrypt hashing).                                           |
| MFA (TOTP)     | Two-factor authentication using authenticator apps (Microsoft Authenticator, Google Authenticator). Required for Admin role, optional for others. |

### 10.2 Authorization & Security

| Area               | Implementation                                                 |
| ------------------ | -------------------------------------------------------------- |
| Identity Provider  | AWS Cognito User Pool with Microsoft Azure AD as federated IdP |
| Authorization      | JWT tokens with role claims, API Gateway Lambda authorizer     |
| Session Management | Token refresh every 1 hour, absolute timeout 8 hours           |
| Data Encryption    | TLS 1.3 in transit, AES-256 at rest (RDS, S3)                  |
| Network            | Aurora in private VPC subnet, no public access                 |
| Secrets            | AWS Secrets Manager for DB credentials, rotated every 30 days  |
| Audit              | CloudWatch logs for all API calls                              |

### 10.3 MFA Policy

| Role            | MFA Requirement        |
| --------------- | ---------------------- |
| Admin           | Required (enforced)    |
| Project Manager | Optional (recommended) |
| Viewer          | Optional               |

---

## 11. Success Criteria

| Metric              | Target                                  |
| ------------------- | --------------------------------------- |
| Page Load Time      | < 2 seconds                             |
| Data Entry Time     | 50% faster than Excel                   |
| System Availability | 99.9% uptime                            |
| User Adoption       | Both users actively using within 1 week |
| Data Accuracy       | Zero calculation errors                 |

---

## 12. Risks and Mitigations

| Risk                  | Probability | Impact | Mitigation                                |
| --------------------- | ----------- | ------ | ----------------------------------------- |
| Scope creep           | Medium      | High   | Strict MVP boundaries, phase 2 backlog    |
| Data migration issues | Low         | Medium | Validate import scripts with sample data  |
| User resistance       | Low         | Medium | Training session, side-by-side comparison |
| Aurora cold start     | Low         | Low    | Keep-alive Lambda, acceptable for 2 users |

---

## 13. Assumptions

1. Users have modern browsers (Chrome, Edge, Safari)
2. Existing Excel data structure remains stable for import
3. Client provides timely feedback during development
4. No integration with external systems required for MVP
5. English language interface is acceptable
6. MVP optimized for standard desktop monitors (1920×1080). Tablet and ultrawide support in future phases.

---

## 14. Future Roadmap (Post-MVP)

The following items are out of scope for MVP but should be considered as the application matures into an enterprise-grade solution.

### 14.1 DevOps & CI/CD

| Item                      | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| Multi-Environment         | Separate dev/staging/prod environments with isolated databases |
| GitHub Actions Pipeline   | Automated build, test, and deploy on push/PR                   |
| Infrastructure Versioning | CDK stacks versioned and deployed through pipeline             |
| Database Migrations       | Automated schema migrations with rollback capability           |
| Feature Flags             | Gradual rollout of new features                                |

### 14.2 Testing Strategy

**MVP Includes:**

- Unit Tests (Vitest) - Business logic, utilities, React hooks
- Manual testing of critical flows

**Future Enhancements:**

| Type              | Tool                         | Coverage                                           |
| ----------------- | ---------------------------- | -------------------------------------------------- |
| Integration Tests | Vitest + MSW                 | API endpoints, database operations                 |
| E2E Tests         | Playwright                   | Critical user flows (login, budget entry, reports) |
| Visual Regression | Playwright + Percy/Chromatic | UI component snapshots, catch unintended changes   |
| Load Testing      | k6 or Artillery              | API performance under load                         |
| Contract Testing  | Pact                         | API contract validation between frontend/backend   |

### 14.3 Observability & Monitoring

| Item                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| CloudWatch Dashboards | Real-time metrics: API latency, error rates, Lambda duration |
| CloudWatch Alarms     | Alerts for error spikes, high latency, failed deployments    |
| X-Ray Tracing         | Distributed tracing across Lambda, API Gateway, Aurora       |
| Centralized Logging   | Structured logs with correlation IDs                         |
| APM                   | Application performance monitoring and anomaly detection     |

### 14.4 Security Hardening

| Item                   | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| AWS WAF                | Web Application Firewall with rate limiting, SQL injection protection |
| Penetration Testing    | Annual third-party security assessment                                |
| Red Team Exercise      | Simulated attack scenarios to test defenses                           |
| Vulnerability Scanning | Dependabot, Snyk, or similar for dependency vulnerabilities           |
| Security Audit Trail   | Immutable log of all data changes with user attribution               |
| SOC 2 Compliance       | If required for enterprise clients                                    |

### 14.5 Functional Enhancements

| Item                    | Description                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spectrum Integration    | Automated import of time/actuals from Spectrum ERP. Fields: JobNumber, TransactionDate, EmployeeID, SpectrumCostCode, Hours, PayType (REG/OT/DT), LaborCost, BurdenCost, FringeCost, TaxesCost. Would replace manual time entry for labor costs. |
| Change Order Workflow   | Approval process for budget changes                                                                                                                                                                                                              |
| Multi-Project Portfolio | Dashboard showing all projects at a glance                                                                                                                                                                                                       |
| Mobile App              | React Native or PWA for field time entry                                                                                                                                                                                                         |
| Email Notifications     | Alerts for variance thresholds, approvals needed                                                                                                                                                                                                 |
| Audit History           | View change history for any record                                                                                                                                                                                                               |
| Data Export             | Excel/CSV export of all data                                                                                                                                                                                                                     |
| Report Builder          | Custom report generation                                                                                                                                                                                                                         |

### 14.6 Responsive Design Enhancements

| Item               | Description                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Tablet Support     | Optimized layouts for iPad/tablet (768px-1024px). Touch-friendly controls for field use.            |
| Ultrawide Monitors | Enhanced layouts for 21:9 and 32:9 displays (2560px+). Multi-panel views, side-by-side comparisons. |
| Mobile Responsive  | Basic read-only access on phones for viewing reports and dashboards.                                |

---

## 15. Sign-Off

| Role            | Name | Signature | Date |
| --------------- | ---- | --------- | ---- |
| Client Sponsor  |      |           |      |
| Project Manager |      |           |      |
| Technical Lead  |      |           |      |

---

## Appendix A: Glossary

| Term      | Definition                                              |
| --------- | ------------------------------------------------------- |
| JTD       | Job-to-Date (cumulative from project start)             |
| GP        | Gross Profit                                            |
| CO        | Change Order                                            |
| ACU       | Aurora Capacity Unit                                    |
| Cost Code | Internal classification for tracking costs by work type |
| Spectrum  | Client's existing ERP/accounting system                 |

---

## Appendix B: Reference Data Volumes

| Table                | Expected Records                                                        |
| -------------------- | ----------------------------------------------------------------------- |
| Projects             | 1-10 (MVP), scalable to 100+                                            |
| Cost Codes           | ~370 (shared reference)                                                 |
| Labor Rates          | ~10 classifications                                                     |
| Users                | 2 (MVP), scalable to 100+                                               |
| Employees            | ~20-50 per project                                                      |
| Budget Lines         | ~500 per project                                                        |
| Daily Time Entries   | ~500-1,000 per project per month (20 employees × 5 days/week × 4 weeks) |
| Actuals              | ~370 per project per month (aggregated from daily entries)              |
| Projection Snapshots | ~12 per project per year (monthly snapshots)                            |
| Projection Details   | ~100 per snapshot                                                       |
| Equipment Catalog    | ~450 (shared reference)                                                 |
