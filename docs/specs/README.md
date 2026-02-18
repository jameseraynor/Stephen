# Feature Specifications

User stories and requirements for each screen of the Project Cost Control System MVP.

## Implementation Order

Specs are numbered by implementation priority (dependencies first):

| #   | Spec                   | Screens                  | Priority            |
| --- | ---------------------- | ------------------------ | ------------------- |
| 01  | Authentication         | Login, MFA, New Password | P0 - Foundation     |
| 02  | Project Selection      | Project Selection Page   | P0 - Foundation     |
| 03  | Cost Codes Management  | Cost Codes Setup         | P0 - Reference Data |
| 04  | Labor Rates Management | Labor Rates Setup        | P0 - Reference Data |
| 05  | Equipment Catalog      | Equipment Setup          | P1 - Reference Data |
| 06  | User Management        | User Management Setup    | P1 - Admin          |
| 07  | Project Dashboard      | Dashboard Page           | P1 - Core           |
| 08  | Budget Entry           | Budget Entry Page        | P1 - Core           |
| 09  | Employee Roster        | Employee Roster Page     | P1 - Core           |
| 10  | Daily Time Entry       | Time Entry Page          | P2 - Core           |
| 11  | Monthly Actuals        | Actuals Page             | P2 - Core           |
| 12  | Projections            | Projections Page         | P2 - Core           |
| 13  | Reports                | Reports Page             | P3 - Reporting      |

## Dependency Graph

```
Auth (01) ──► Project Selection (02) ──► Dashboard (07)
                                              │
Cost Codes (03) ──────────────────────────────┤
Labor Rates (04) ─────────────────────────────┤
                                              │
                    ┌─────────────────────────┤
                    ▼                         ▼
              Budget (08)              Employees (09)
                    │                         │
                    ▼                         ▼
              Actuals (11) ◄──────── Time Entry (10)
                    │
                    ▼
            Projections (12)
                    │
                    ▼
              Reports (13)

Equipment (05) ── independent (reference data)
Users (06) ── independent (admin only)
```

## Spec Format

Each spec follows this structure:

- Overview & purpose
- User stories with acceptance criteria
- UI/UX requirements
- Business rules & validations
- API endpoints used
- Permissions by role
- Dependencies
- Edge cases
