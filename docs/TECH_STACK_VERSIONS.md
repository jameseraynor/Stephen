# Tech Stack - Current Versions

Last updated: December 2024

## Frontend

| Technology   | Version | Notes                |
| ------------ | ------- | -------------------- |
| React        | 19.0.0  | Latest stable        |
| TypeScript   | 5.7.2   | Latest stable        |
| Vite         | 6.0.5   | Build tool           |
| React Router | 7.1.3   | Routing              |
| Tailwind CSS | 3.4.17  | Styling              |
| Vitest       | 2.1.8   | Testing framework    |
| ESLint       | 9.17.0  | Linter (flat config) |
| PostCSS      | 8.4.49  | CSS processing       |

### UI Libraries

| Library        | Version | Usage                             |
| -------------- | ------- | --------------------------------- |
| clsx           | 2.1.1   | Class name utility                |
| tailwind-merge | 2.5.5   | Tailwind class merging            |
| shadcn/ui      | Latest  | UI components (copied to project) |

## Backend

| Technology | Version  | Notes                |
| ---------- | -------- | -------------------- |
| Node.js    | 24.x LTS | Lambda runtime       |
| TypeScript | 5.7.2    | Type safety          |
| AWS SDK    | v3       | AWS services         |
| PostgreSQL | 16.6     | Aurora Serverless v2 |

## Infrastructure

| Technology     | Version | Notes                  |
| -------------- | ------- | ---------------------- |
| AWS CDK        | 2.x     | Infrastructure as Code |
| CloudFormation | Latest  | AWS native IaC         |

## Development Tools

| Tool | Version | Usage           |
| ---- | ------- | --------------- |
| npm  | 10.x+   | Package manager |
| Git  | 2.x+    | Version control |

## AWS Services

| Service              | Version/Tier    | Notes           |
| -------------------- | --------------- | --------------- |
| Aurora Serverless v2 | PostgreSQL 16.6 | Database        |
| Lambda               | Node.js 24.x    | Compute         |
| API Gateway          | REST API        | API layer       |
| Cognito              | Latest          | Authentication  |
| S3                   | Latest          | Static hosting  |
| CloudFront           | Latest          | CDN             |
| Secrets Manager      | Latest          | Secrets storage |

## Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 88+             |
| Safari  | 14+             |
| Edge    | 90+             |

## Node.js Requirements

- **Development**: Node.js 20.x or 22.x LTS
- **Production (Lambda)**: Node.js 24.x LTS

---

## Version Updates

### Frontend

To update frontend dependencies:

```bash
cd frontend
npm update
npm audit fix
```

### Check Installed Versions

```bash
cd frontend
npm list --depth=0
```

### Check Available Versions

```bash
npm outdated
```

---

## Compatibility Notes

### React 19

- Requires Node.js 18.x or higher
- Compatible with TypeScript 5.0+
- Server Components improvements (not used in MVP)

### Vite 6

- Requires Node.js 18.x or higher
- HMR performance improvements
- Native support for TypeScript 5.x

### ESLint 9

- New "flat config" format (eslint.config.js)
- Not compatible with .eslintrc.\* (legacy)
- Requires plugin updates

### Tailwind CSS 3.4

- Compatible with PostCSS 8.x
- Container queries support
- JIT mode improvements

---

## Resolved Deprecations

✅ All deprecated dependencies have been updated:

- ~~inflight@1.0.6~~ → Removed (not needed)
- ~~rimraf@3.x~~ → Updated to 4.x+ (transitive)
- ~~glob@7.x~~ → Updated to 10.x+ (transitive)
- ~~@humanwhocodes/\*~~ → Replaced by @eslint/\*
- ~~eslint@8.x~~ → Updated to 9.x

---

## Update Roadmap

### Q1 2025

- [ ] Monitor React 19.1 (when released)
- [ ] Update AWS CDK to latest version
- [ ] Review new Vite 6.x features

### Q2 2025

- [ ] Evaluate Tailwind CSS 4.0 (when stable)
- [ ] Update Node.js Lambda runtime if new LTS is available
- [ ] Review security updates

---

## References

- [React Releases](https://github.com/facebook/react/releases)
- [Vite Releases](https://github.com/vitejs/vite/releases)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [AWS Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- [TypeScript Releases](https://github.com/microsoft/TypeScript/releases)
