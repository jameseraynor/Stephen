# Project Cost Control System - Documentation

Complete documentation for the Project Cost Control System.

## 📚 Documentation Index

### 🏗️ Architecture Documentation

| Document                                                          | Description                                                       | Audience                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| [System Architecture](SYSTEM_ARCHITECTURE.md)                     | Complete system overview, technology stack, and design principles | All                            |
| [Architecture Decision Records](ARCHITECTURE_DECISION_RECORDS.md) | Key architectural decisions and rationale                         | Architects, Developers         |
| [Design System](Design_System.md)                                 | UI/UX design guidelines and component library                     | Frontend Developers, Designers |

### 📋 Planning & Requirements

| Document                                            | Description                               | Audience    |
| --------------------------------------------------- | ----------------------------------------- | ----------- |
| [MVP Project Plan](MVP_Project_Plan.md)             | Project scope, timeline, and deliverables | All         |
| [Use Cases](diagrams/architecture/03-use-cases.png) | User roles and system capabilities        | Product, QA |

### 🔧 Development Guides

| Document                                                                       | Description                     | Audience            |
| ------------------------------------------------------------------------------ | ------------------------------- | ------------------- |
| [API Reference](api/API_REFERENCE.md)                                          | Complete API documentation      | Backend Developers  |
| [OpenAPI Specification](api/openapi.yaml)                                      | Machine-readable API spec       | All Developers      |
| [Database Conventions](.kiro/steering/database-conventions.md)                 | Database design patterns        | Backend Developers  |
| [React TypeScript Conventions](.kiro/steering/react-typescript-conventions.md) | Frontend coding standards       | Frontend Developers |
| [AWS CDK Patterns](.kiro/steering/aws-cdk-patterns.md)                         | Infrastructure as Code patterns | DevOps, Backend     |
| [API Design Standards](.kiro/steering/api-design-standards.md)                 | REST API design guidelines      | Backend Developers  |
| [Testing Guidelines](.kiro/steering/testing-guidelines.md)                     | Testing strategies and patterns | All Developers      |

### 🚀 Deployment & Operations

| Document                                                   | Description                              | Audience           |
| ---------------------------------------------------------- | ---------------------------------------- | ------------------ |
| [Deployment Guide](DEPLOYMENT_GUIDE.md)                    | Step-by-step deployment instructions     | DevOps, Architects |
| [Security Checklist](.kiro/steering/security-checklist.md) | Security requirements and best practices | All, Security Team |

### 📊 Diagrams

| Category              | Diagrams                                                                                                            | Description                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Architecture**      | [View](diagrams/architecture/)                                                                                      | System architecture and components   |
| - AWS Infrastructure  | [PNG](diagrams/architecture/01-aws-infrastructure.png) • [PUML](diagrams/architecture/01-aws-infrastructure.puml)   | Complete AWS serverless architecture |
| - Frontend Components | [PNG](diagrams/architecture/02-frontend-components.png) • [PUML](diagrams/architecture/02-frontend-components.puml) | React component hierarchy            |
| - Use Cases           | [PNG](diagrams/architecture/03-use-cases.png) • [PUML](diagrams/architecture/03-use-cases.puml)                     | User roles and capabilities          |
| **Data Model**        | [View](diagrams/data-model/)                                                                                        | Database schema and data flow        |
| - Database Schema     | [PNG](diagrams/data-model/01-database-schema.png) • [PUML](diagrams/data-model/01-database-schema.puml)             | PostgreSQL ERD                       |
| - Data Pipeline       | [PNG](diagrams/data-model/02-data-pipeline.png) • [PUML](diagrams/data-model/02-data-pipeline.puml)                 | Data flow from input to reports      |
| **Flows**             | [View](diagrams/flows/)                                                                                             | User and system flows                |
| - Authentication      | [PNG](diagrams/flows/01-authentication.png) • [PUML](diagrams/flows/01-authentication.puml)                         | Login, SSO, MFA flows                |
| - Project Creation    | [PNG](diagrams/flows/02-project-creation.png) • [PUML](diagrams/flows/02-project-creation.puml)                     | End-to-end project creation          |
| - Time Entry          | [PNG](diagrams/flows/03-time-entry.png) • [PUML](diagrams/flows/03-time-entry.puml)                                 | Daily time entry workflow            |
| **Deployment**        | [View](diagrams/deployment/)                                                                                        | Deployment process                   |
| - Deployment Process  | [PNG](diagrams/deployment/01-deployment-process.png) • [PUML](diagrams/deployment/01-deployment-process.puml)       | AWS CDK deployment flow              |
| **Wireframes**        | [View](diagrams/wireframes/)                                                                                        | UI screen wireframes (17 screens)    |
| - Login               | [PNG](diagrams/wireframes/01-login.png) • [PUML](diagrams/wireframes/01-login.puml)                                 | Email/password + SSO login           |
| - MFA                 | [PNG](diagrams/wireframes/01b-mfa.png) • [PUML](diagrams/wireframes/01b-mfa.puml)                                   | TOTP verification                    |
| - New Password        | [PNG](diagrams/wireframes/01c-new-password.png) • [PUML](diagrams/wireframes/01c-new-password.puml)                 | First-login password change          |
| - Project Selection   | [PNG](diagrams/wireframes/02-project-selection.png) • [PUML](diagrams/wireframes/02-project-selection.puml)         | Project list with search             |
| - Dashboard           | [PNG](diagrams/wireframes/03-dashboard.png) • [PUML](diagrams/wireframes/03-dashboard.puml)                         | Project financial overview           |
| - Budget Entry        | [PNG](diagrams/wireframes/04-budget-entry.png) • [PUML](diagrams/wireframes/04-budget-entry.puml)                   | Budget lines table                   |
| - Budget Modal        | [PNG](diagrams/wireframes/04b-budget-modal.png) • [PUML](diagrams/wireframes/04b-budget-modal.puml)                 | Add/edit budget line                 |
| - Employee Roster     | [PNG](diagrams/wireframes/05-employee-roster.png) • [PUML](diagrams/wireframes/05-employee-roster.puml)             | Crew management                      |
| - Employee Modal      | [PNG](diagrams/wireframes/05b-employee-modal.png) • [PUML](diagrams/wireframes/05b-employee-modal.puml)             | Add/edit employee                    |
| - Daily Time Entry    | [PNG](diagrams/wireframes/06-daily-time-entry.png) • [PUML](diagrams/wireframes/06-daily-time-entry.puml)           | Weekly time grid                     |
| - Monthly Actuals     | [PNG](diagrams/wireframes/07-monthly-actuals.png) • [PUML](diagrams/wireframes/07-monthly-actuals.puml)             | Monthly cost tracking                |
| - Projections         | [PNG](diagrams/wireframes/08-projections.png) • [PUML](diagrams/wireframes/08-projections.puml)                     | Labor forecast with snapshots        |
| - Reports             | [PNG](diagrams/wireframes/09-reports.png) • [PUML](diagrams/wireframes/09-reports.puml)                             | Report selection and preview         |
| - Cost Codes          | [PNG](diagrams/wireframes/10-cost-codes.png) • [PUML](diagrams/wireframes/10-cost-codes.puml)                       | Cost code management                 |
| - Labor Rates         | [PNG](diagrams/wireframes/11-labor-rates.png) • [PUML](diagrams/wireframes/11-labor-rates.puml)                     | Labor rate management                |
| - Equipment Catalog   | [PNG](diagrams/wireframes/12-equipment-catalog.png) • [PUML](diagrams/wireframes/12-equipment-catalog.puml)         | Equipment reference data             |
| - User Management     | [PNG](diagrams/wireframes/13-user-management.png) • [PUML](diagrams/wireframes/13-user-management.puml)             | User accounts and roles              |

---

## 🎯 Quick Start Guides

### For Developers

1. **Setup Development Environment**

   ```bash
   git clone <repository>
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ../infrastructure && npm install
   ```

2. **Read Key Documents**
   - [System Architecture](SYSTEM_ARCHITECTURE.md) - Understand the system
   - [React TypeScript Conventions](.kiro/steering/react-typescript-conventions.md) - Frontend standards
   - [API Design Standards](.kiro/steering/api-design-standards.md) - Backend standards

3. **Start Development**

   ```bash
   # Frontend
   cd frontend && npm run dev

   # Backend (local)
   cd backend && npm run dev
   ```

### For Architects

1. **Review Architecture**
   - [System Architecture](SYSTEM_ARCHITECTURE.md)
   - [Architecture Decision Records](ARCHITECTURE_DECISION_RECORDS.md)
   - [AWS Infrastructure Diagram](diagrams/architecture/01-aws-infrastructure.png)

2. **Understand Data Model**
   - [Database Schema](diagrams/data-model/01-database-schema.png)
   - [Database Conventions](.kiro/steering/database-conventions.md)

3. **Review Security**
   - [Security Checklist](.kiro/steering/security-checklist.md)
   - [Authentication Flow](diagrams/flows/01-authentication.png)

### For DevOps

1. **Deployment Setup**
   - [Deployment Guide](DEPLOYMENT_GUIDE.md)
   - [AWS CDK Patterns](.kiro/steering/aws-cdk-patterns.md)
   - [Deployment Diagram](diagrams/deployment/01-deployment-process.png)

2. **Infrastructure as Code**

   ```bash
   cd infrastructure
   cdk synth
   cdk diff
   cdk deploy --all
   ```

3. **Monitoring**
   - CloudWatch dashboards
   - X-Ray tracing
   - CloudWatch alarms

### For Product/QA

1. **Understand Features**
   - [MVP Project Plan](MVP_Project_Plan.md)
   - [Use Cases Diagram](diagrams/architecture/03-use-cases.png)

2. **Test Flows**
   - [Authentication Flow](diagrams/flows/01-authentication.png)
   - [Project Creation Flow](diagrams/flows/02-project-creation.png)
   - [Time Entry Flow](diagrams/flows/03-time-entry.png)

3. **API Testing**
   - [API Reference](api/API_REFERENCE.md)
   - [OpenAPI Spec](api/openapi.yaml)

---

## 📖 Documentation Standards

### Writing Guidelines

1. **Use Markdown** for all documentation
2. **Include diagrams** where helpful (PlantUML preferred)
3. **Keep it current** - update docs with code changes
4. **Be concise** - respect reader's time
5. **Use examples** - show, don't just tell

### Diagram Standards

- Use PlantUML for all diagrams
- Follow [Diagram Best Practices](diagrams/DIAGRAM_BEST_PRACTICES.md)
- Update PNG when modifying PUML: `./scripts/update-diagrams.sh`
- Use consistent color scheme (AWS colors)

### Code Documentation

- **TypeScript**: Use JSDoc comments
- **React Components**: Document props with TypeScript interfaces
- **API Endpoints**: Document in OpenAPI spec
- **Database**: Document schema in migrations

---

## 🔄 Keeping Documentation Updated

### When to Update

| Change Type         | Documents to Update                 |
| ------------------- | ----------------------------------- |
| New feature         | MVP Plan, Use Cases, API Reference  |
| Architecture change | System Architecture, ADRs, Diagrams |
| Database change     | Database Schema, Conventions        |
| API change          | API Reference, OpenAPI Spec         |
| Deployment change   | Deployment Guide, CDK Patterns      |
| Security change     | Security Checklist, Architecture    |

### Update Process

1. Make code changes
2. Update relevant documentation
3. Regenerate diagrams if needed: `./scripts/update-diagrams.sh`
4. Review documentation in PR
5. Commit docs with code changes

---

## 🤝 Contributing to Documentation

### Adding New Documents

1. Create document in appropriate directory
2. Follow existing format and style
3. Add to this index (README.md)
4. Include in PR description

### Improving Existing Documents

1. Create issue describing improvement
2. Make changes in feature branch
3. Submit PR with clear description
4. Tag relevant reviewers

### Reporting Issues

Found outdated or incorrect documentation?

1. Create GitHub issue with "documentation" label
2. Include document name and section
3. Describe the issue
4. Suggest correction if possible

---

## 📞 Support

### Documentation Questions

- **Slack**: #project-cost-control-docs
- **Email**: docs@costcontrol.com
- **GitHub**: Create issue with "question" label

### Technical Support

- **Slack**: #project-cost-control-dev
- **Email**: dev@costcontrol.com
- **On-call**: See PagerDuty schedule

---

## 📝 Document Versions

| Version | Date       | Changes                       |
| ------- | ---------- | ----------------------------- |
| 1.0.0   | 2025-01-15 | Initial documentation         |
| 1.1.0   | 2025-02-16 | Added ADRs, improved diagrams |

---

## 🔗 External Resources

### AWS Documentation

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

### Technology Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Best Practices

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [12 Factor App](https://12factor.net/)
- [REST API Design](https://restfulapi.net/)
- [PlantUML Guide](https://plantuml.com/)

---

## 📄 License

This documentation is proprietary and confidential.
© 2025 Your Company. All rights reserved.
