# Tech Stack - Versiones Actuales

Última actualización: Diciembre 2024

## Frontend

| Tecnología   | Versión | Notas                |
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

| Librería       | Versión | Uso                               |
| -------------- | ------- | --------------------------------- |
| clsx           | 2.1.1   | Class name utility                |
| tailwind-merge | 2.5.5   | Tailwind class merging            |
| shadcn/ui      | Latest  | UI components (copied to project) |

## Backend

| Tecnología | Versión  | Notas                |
| ---------- | -------- | -------------------- |
| Node.js    | 24.x LTS | Lambda runtime       |
| TypeScript | 5.7.2    | Type safety          |
| AWS SDK    | v3       | AWS services         |
| PostgreSQL | 16.6     | Aurora Serverless v2 |

## Infrastructure

| Tecnología     | Versión | Notas                  |
| -------------- | ------- | ---------------------- |
| AWS CDK        | 2.x     | Infrastructure as Code |
| CloudFormation | Latest  | AWS native IaC         |

## Development Tools

| Tool | Versión | Uso             |
| ---- | ------- | --------------- |
| npm  | 10.x+   | Package manager |
| Git  | 2.x+    | Version control |

## AWS Services

| Servicio             | Versión/Tier    | Notas           |
| -------------------- | --------------- | --------------- |
| Aurora Serverless v2 | PostgreSQL 16.6 | Database        |
| Lambda               | Node.js 24.x    | Compute         |
| API Gateway          | REST API        | API layer       |
| Cognito              | Latest          | Authentication  |
| S3                   | Latest          | Static hosting  |
| CloudFront           | Latest          | CDN             |
| Secrets Manager      | Latest          | Secrets storage |

## Browser Support

| Browser | Versión Mínima |
| ------- | -------------- |
| Chrome  | 90+            |
| Firefox | 88+            |
| Safari  | 14+            |
| Edge    | 90+            |

## Node.js Requirements

- **Development**: Node.js 20.x o 22.x LTS
- **Production (Lambda)**: Node.js 24.x LTS

---

## Actualización de Versiones

### Frontend

Para actualizar dependencias del frontend:

```bash
cd frontend
npm update
npm audit fix
```

### Verificar Versiones Instaladas

```bash
cd frontend
npm list --depth=0
```

### Verificar Versiones Disponibles

```bash
npm outdated
```

---

## Notas de Compatibilidad

### React 19

- Requiere Node.js 18.x o superior
- Compatible con TypeScript 5.0+
- Mejoras en Server Components (no usadas en MVP)

### Vite 6

- Requiere Node.js 18.x o superior
- Mejoras de performance en HMR
- Soporte nativo para TypeScript 5.x

### ESLint 9

- Nueva configuración "flat config" (eslint.config.js)
- No compatible con .eslintrc.\* (legacy)
- Requiere actualización de plugins

### Tailwind CSS 3.4

- Compatible con PostCSS 8.x
- Soporte para container queries
- Mejoras en JIT mode

---

## Deprecations Resueltas

✅ Todas las dependencias deprecated fueron actualizadas:

- ~~inflight@1.0.6~~ → Removido (no necesario)
- ~~rimraf@3.x~~ → Actualizado a 4.x+ (transitivo)
- ~~glob@7.x~~ → Actualizado a 10.x+ (transitivo)
- ~~@humanwhocodes/\*~~ → Reemplazado por @eslint/\*
- ~~eslint@8.x~~ → Actualizado a 9.x

---

## Roadmap de Actualizaciones

### Q1 2025

- [ ] Monitorear React 19.1 (cuando salga)
- [ ] Actualizar AWS CDK a última versión
- [ ] Revisar nuevas features de Vite 6.x

### Q2 2025

- [ ] Evaluar Tailwind CSS 4.0 (cuando sea stable)
- [ ] Actualizar Node.js Lambda runtime si hay nueva LTS
- [ ] Revisar actualizaciones de seguridad

---

## Referencias

- [React Releases](https://github.com/facebook/react/releases)
- [Vite Releases](https://github.com/vitejs/vite/releases)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [AWS Lambda Runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- [TypeScript Releases](https://github.com/microsoft/TypeScript/releases)
