# Cost Control - Frontend Component Library

## 🚀 Cómo Ver los Componentes

### 1. Instalar Dependencias

```bash
cd frontend
npm install
```

### 2. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Esto abrirá automáticamente tu navegador en `http://localhost:5173`

### 3. Ver la Demostración

Verás una página con **8 secciones** mostrando todos los componentes:

1. **Metric Cards** - KPIs para dashboard
2. **Project Card** - Card de proyecto (clickeable)
3. **Status Badges** - Estados con colores
4. **Cost Type Icons** - Iconos L/M/E/S/F/O
5. **Variance Indicators** - Varianzas con colores y flechas
6. **Specialized Inputs** - Inputs editables (prueba escribir!)
7. **Cost Code Select** - Dropdown con búsqueda
8. **Data Table** - Tabla con sorting y click en filas

---

## 📁 Estructura de Componentes

```
src/
├── components/
│   └── shared/
│       ├── CostCodeSelect.tsx       # Dropdown con búsqueda
│       ├── CostTypeIcon.tsx         # Iconos L/M/E/S/F/O
│       ├── CurrencyInput.tsx        # Input $
│       ├── DataTable.tsx            # Tabla genérica
│       ├── HoursInput.tsx           # Input hrs
│       ├── MetricCard.tsx           # Card KPI
│       ├── PercentageInput.tsx      # Input %
│       ├── ProjectCard.tsx          # Card proyecto
│       ├── StatusBadge.tsx          # Badge estados
│       ├── VarianceIndicator.tsx    # Indicador varianza
│       ├── index.ts                 # Exports
│       ├── README.md                # Documentación completa
│       └── EXAMPLES.tsx             # 7 ejemplos de uso
├── utils/
│   └── formatters.ts                # Funciones de formato
└── lib/
    └── utils.ts                     # cn() helper
```

---

## 📚 Documentación

### Ver Documentación Completa

```bash
# Abre en tu editor
code src/components/shared/README.md
```

### Ver Ejemplos de Código

```bash
# Abre en tu editor
code src/components/shared/EXAMPLES.tsx
```

---

## 🎯 Próximos Pasos

Una vez que veas los componentes funcionando y tengas aprobación de diseño:

1. **Crear páginas** usando estos componentes
2. **Agregar routing** (React Router ya está en package.json)
3. **Integrar API** (crear hooks y services)
4. **Agregar autenticación** (AWS Amplify)

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter
npm run test         # Tests con Vitest
npm run test:ui      # Tests con UI
npm run test:coverage # Coverage report
```

---

## 💡 Tips

- **Edita los inputs** en la demo para ver el formato automático
- **Click en las filas** de la tabla para ver el evento
- **Busca en el Cost Code Select** para ver el filtrado en tiempo real
- **Revisa el código** en `ComponentShowcase.tsx` para ver cómo usar los componentes

---

## 🎨 Design System

Los componentes siguen el Design System definido en:

- `docs/Design_System.md`
- Colores: Primary (blue), Secondary (slate), Success, Warning, Error
- Typography: Inter (sans), JetBrains Mono (mono)
- Spacing: Tailwind scale (4px base)

---

## ✅ Componentes Listos

- [x] CurrencyInput
- [x] PercentageInput
- [x] HoursInput
- [x] CostCodeSelect
- [x] DataTable
- [x] ProjectCard
- [x] MetricCard
- [x] StatusBadge
- [x] CostTypeIcon
- [x] VarianceIndicator

**Total: 10 componentes + 8 formatters + utils**

---

## 🐛 Troubleshooting

### Error: Cannot find module '@/...'

Asegúrate de que `tsconfig.json` tiene los path aliases configurados.

### Tailwind no funciona

Verifica que `tailwind.config.js` y `postcss.config.js` existen.

### Puerto 5173 ocupado

Cambia el puerto en `vite.config.ts`:

```ts
server: {
  port: 3000;
}
```

---

¡Disfruta explorando los componentes! 🎉
