# 13 - Reports

## Overview

Generate and export project reports including Executive Summary, Budget vs Actual, Monthly Trend, and Projection History. Reports can be previewed on screen and exported as PDF.

## Screen

- `/projects/:id/reports` — ReportsPage

## User Stories

### US-13.1: View Report Types

**As a** user,
**I want to** see available report types,
**So that** I can choose which report to generate.

**Acceptance Criteria:**

- [ ] Report type selector (tabs or cards):
  - Executive Summary
  - Budget vs Actual
  - Monthly Trend
  - Projection History
- [ ] Each type shows brief description of what it contains
- [ ] Default: Executive Summary selected

### US-13.2: Executive Summary Report

**As a** user,
**I want to** view a one-page executive summary,
**So that** I can quickly assess project health.

**Acceptance Criteria:**

- [ ] Single-page layout optimized for print/PDF
- [ ] Sections:
  1. Project Identification: name, job number, PM, dates, status
  2. Contract Summary: original contract, approved COs, total contract
  3. Key Metrics Table:
     | Metric | Budget | JTD Actual | Forecast | Variance |
     Per cost type (L/M/E/S/F/O) + Total
  4. GP Summary: Budgeted GP%, Current GP%, Projected GP%, Variance
  5. Hours Summary: Budgeted, JTD, Remaining, % Complete
  6. Top 5 Cost Drivers: cost codes with highest actual spend
  7. Notes/Risks: text area (editable by Admin/PM)
- [ ] All values formatted as currency/percentage
- [ ] Color coding for variances (green=favorable, red=unfavorable)

### US-13.3: Budget vs Actual Report

**As a** user,
**I want to** see a detailed budget vs actual comparison,
**So that** I can identify where costs deviate from plan.

**Acceptance Criteria:**

- [ ] Table with one row per cost code:
      | Cost Code | Description | Type | Budget | JTD Actual | Variance ($) | Variance (%) | % Complete |
- [ ] Sortable by any column
- [ ] Filter by cost type
- [ ] Subtotals by cost type
- [ ] Grand total row
- [ ] Over-budget items highlighted in red
- [ ] Under-budget items in green

### US-13.4: Monthly Trend Report

**As a** user,
**I want to** see month-over-month cost trends,
**So that** I can identify spending patterns.

**Acceptance Criteria:**

- [ ] Table: rows = cost types, columns = months (project start to current)
- [ ] Values: actual cost per month
- [ ] Cumulative row showing running total
- [ ] Line chart: cumulative cost over time by cost type
- [ ] Budget line overlay on chart for comparison

### US-13.5: Projection History Report

**As a** user,
**I want to** compare projection snapshots over time,
**So that** I can see how forecasts have evolved.

**Acceptance Criteria:**

- [ ] Table: rows = snapshots (by date), columns = key metrics
      | Snapshot | Date | Projected GP$ | Projected GP% | Total Forecast | Variance from Budget |
- [ ] Line chart: Projected GP% over time (one point per snapshot)
- [ ] Highlights trend direction (improving/deteriorating)

### US-13.6: Export to PDF

**As a** user,
**I want to** export any report as PDF,
**So that** I can share it with stakeholders.

**Acceptance Criteria:**

- [ ] "Export PDF" button on each report
- [ ] PDF includes:
  - Company logo (if configured)
  - Report title and project info
  - Generated date
  - All tables and charts from the report
  - Page numbers
- [ ] PDF is formatted for letter size (8.5" × 11")
- [ ] Charts rendered as images in PDF
- [ ] File name: `{project_name}_{report_type}_{date}.pdf`
- [ ] Download starts immediately (client-side generation)

### US-13.7: Print Report

**As a** user,
**I want to** print a report directly,
**So that** I can have a physical copy for meetings.

**Acceptance Criteria:**

- [ ] "Print" button opens browser print dialog
- [ ] Print stylesheet hides navigation, buttons, and non-report elements
- [ ] Report content fits on standard pages
- [ ] Page breaks at logical points (between sections)

## UI/UX Requirements

- Report preview takes full content area
- Print-optimized layout (no sidebars, clean margins)
- Charts use consistent color scheme
- Tables have alternating row colors for readability
- Currency and percentage formatting consistent throughout
- Loading state while generating report data
- Desktop-optimized (1920×1080). Tablet/mobile support is post-MVP.

## Business Rules

| Rule               | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| Data Source        | Reports aggregate data from budget, actuals, and projections |
| Real-Time          | Reports always show current data (not cached)                |
| GP Calculations    | Same formulas as Dashboard (see Spec 07)                     |
| Variance           | Budget - Actual (positive = under budget = favorable)        |
| % Complete         | JTD Actual / Budget × 100                                    |
| Top 5 Cost Drivers | Sorted by JTD actual amount descending                       |
| PDF Generation     | Client-side using library (e.g., jsPDF, react-pdf)           |
| All Roles          | All authenticated users can view and export reports          |

## API Endpoints

Reports use existing endpoints to aggregate data:

| Data Needed     | Method | Endpoint                                |
| --------------- | ------ | --------------------------------------- |
| Project details | GET    | `/api/projects/{id}`                    |
| Project summary | GET    | `/api/projects/{id}/summary`            |
| Budget lines    | GET    | `/api/projects/{projectId}/budget`      |
| All actuals     | GET    | `/api/projects/{projectId}/actuals`     |
| Projections     | GET    | `/api/projects/{projectId}/projections` |

No dedicated report API needed — reports are assembled client-side from existing data.

## Permissions

| Action           | Admin | PM            | Viewer        |
| ---------------- | ----- | ------------- | ------------- |
| View reports     | ✅    | ✅ (assigned) | ✅ (assigned) |
| Export PDF       | ✅    | ✅ (assigned) | ✅ (assigned) |
| Edit notes/risks | ✅    | ✅ (assigned) | ❌            |

## Dependencies

- Spec 01 (Authentication)
- Spec 02 (Project Selection) — project context
- Spec 07 (Dashboard) — shares GP calculation logic
- Spec 08 (Budget) — budget data
- Spec 11 (Actuals) — actuals data
- Spec 12 (Projections) — projection snapshots
- PDF library (jsPDF, @react-pdf/renderer, or html2pdf)

## Edge Cases

- Project with no budget → report shows $0 budget, "No budget data"
- Project with no actuals → report shows $0 actuals, 0% complete
- Project with no projections → projection history report shows "No projections created"
- Very large project (100+ cost codes) → table pagination in report, multi-page PDF
- Chart with single data point → show as dot, not line
- PDF generation fails → show error toast, suggest trying again
- Report data changes between preview and export → export uses data at time of click
