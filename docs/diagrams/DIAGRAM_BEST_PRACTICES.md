# PlantUML Diagram Best Practices

Este documento define las mejores prácticas para crear diagramas profesionales y organizados con PlantUML.

## Principios Generales

### 1. Claridad sobre Complejidad

- Mantén los diagramas simples y enfocados
- Un diagrama = Un concepto principal
- Si es muy complejo, divídelo en múltiples diagramas

### 2. Consistencia Visual

- Usa el mismo esquema de colores en todos los diagramas
- Mantén el mismo estilo de flechas y líneas
- Usa la misma nomenclatura

### 3. Jerarquía Visual

- Usa colores para agrupar elementos relacionados
- Usa tamaños de fuente para indicar importancia
- Usa grosor de líneas para indicar flujo principal

## Esquema de Colores AWS

```plantuml
!define AWS_ORANGE #FF9900  ' Content Delivery, Monitoring
!define AWS_BLUE #146EB4    ' API, Database
!define AWS_GREEN #7AA116   ' Compute (Lambda)
!define AWS_RED #DD344C     ' Security Services
!define AWS_DARK #232F3E    ' Text, Borders
```

## Configuración Base Recomendada

```plantuml
@startuml
skinparam linetype ortho
skinparam defaultTextAlignment center
skinparam shadowing false
skinparam ArrowThickness 2
skinparam packageStyle rectangle

title Título del Diagrama\nSubtítulo o Descripción
@enduml
```

## Estructura de Diagramas de Arquitectura

### Template Básico

```plantuml
@startuml Architecture Diagram
' Configuración
skinparam linetype ortho
skinparam defaultTextAlignment center
skinparam shadowing false

' Título
title Sistema de Arquitectura\nDescripción Breve

' Actores externos
actor "Usuario" as user

' Capas organizadas en packages
package "Capa de Presentación" {
    rectangle "Componente 1" as comp1 #FF9900
    rectangle "Componente 2" as comp2 #FF9900
}

package "Capa de Negocio" {
    rectangle "Servicio 1" as svc1 #146EB4
    rectangle "Servicio 2" as svc2 #146EB4
}

package "Capa de Datos" {
    database "Base de Datos" as db #7AA116
}

' Conexiones con etiquetas claras
user --> comp1 : 1. Solicitud HTTP
comp1 --> svc1 : 2. Llamada API
svc1 --> db : 3. Query SQL

' Notas explicativas
note right of svc1
  Información adicional
  sobre el servicio
end note

' Leyenda
legend right
  |= Color |= Tipo |
  |<#FF9900> | Presentación |
  |<#146EB4> | Negocio |
  |<#7AA116> | Datos |
endlegend

@enduml
```

## Diagramas de Secuencia

### Template Profesional

```plantuml
@startuml Sequence Diagram
skinparam sequenceMessageAlign center
skinparam shadowing false
skinparam ArrowThickness 2

title Flujo de Autenticación

actor Usuario as user
participant "Frontend" as fe
participant "API Gateway" as api
participant "Auth Service" as auth
database "Database" as db

user -> fe : 1. Ingresar credenciales
fe -> api : 2. POST /login
api -> auth : 3. Validar usuario
auth -> db : 4. Query usuario
db --> auth : 5. Datos usuario
auth --> api : 6. Token JWT
api --> fe : 7. Token + datos
fe --> user : 8. Redirigir a dashboard

note right of auth
  El token JWT incluye:
  - User ID
  - Roles
  - Expiración
end note

@enduml
```

## Diagramas de Base de Datos (ERD)

### Template con Estilo

```plantuml
@startuml Database ERD
skinparam linetype ortho
skinparam shadowing false
skinparam classBackgroundColor white
skinparam classBorderColor #232F3E
skinparam classBorderThickness 2

title Modelo de Datos\nBase de Datos PostgreSQL

!define Table(name,desc) class name as "desc" << (T,#E6F3FF) >>
!define primary_key(x) <b><color:#DD344C>PK: x</color></b>
!define foreign_key(x) <color:#146EB4>FK: x</color>
!define column(x) <color:#232F3E>x</color>

Table(USERS, "USERS") {
  primary_key(id: UUID)
  column(email: VARCHAR(255))
  column(name: VARCHAR(255))
  column(created_at: TIMESTAMP)
}

Table(PROJECTS, "PROJECTS") {
  primary_key(id: UUID)
  foreign_key(user_id: UUID)
  column(name: VARCHAR(255))
  column(status: VARCHAR(50))
  column(created_at: TIMESTAMP)
}

USERS "1" -- "0..*" PROJECTS : creates

note right of USERS
  Tabla de usuarios
  del sistema
end note

@enduml
```

## Diagramas de Componentes

### Organización por Módulos

```plantuml
@startuml Component Diagram
skinparam componentStyle rectangle
skinparam linetype ortho
skinparam shadowing false

title Arquitectura de Componentes Frontend

package "Módulo de Proyectos" #lightblue {
    component [ProjectList] as list
    component [ProjectDetail] as detail
    component [ProjectForm] as form
}

package "Módulo de Usuarios" #lightgreen {
    component [UserList] as ulist
    component [UserProfile] as profile
}

package "Servicios Compartidos" #lightyellow {
    component [API Client] as api
    component [Auth Service] as auth
}

list --> api : usa
detail --> api : usa
form --> api : usa
ulist --> api : usa
profile --> api : usa

api --> auth : requiere

legend right
  |= Color |= Módulo |
  |<#lightblue> | Proyectos |
  |<#lightgreen> | Usuarios |
  |<#lightyellow> | Compartido |
endlegend

@enduml
```

## Mejores Prácticas Específicas

### 1. Uso de Colores

✅ **Bueno:**

```plantuml
rectangle "API Gateway" as api #146EB4
rectangle "Lambda Function" as lambda #7AA116
```

❌ **Malo:**

```plantuml
rectangle "API Gateway" as api #FF00FF
rectangle "Lambda Function" as lambda #00FFFF
```

### 2. Etiquetas en Conexiones

✅ **Bueno:**

```plantuml
user -> api : 1. POST /login\n(email, password)
api -> lambda : 2. Invoke function
```

❌ **Malo:**

```plantuml
user -> api
api -> lambda
```

### 3. Notas Explicativas

✅ **Bueno:**

```plantuml
note right of component #FEFECE
  <b>Configuración:</b>
  • Timeout: 30s
  • Memory: 512MB
  • Runtime: Node.js 24
end note
```

❌ **Malo:**

```plantuml
note right of component
  timeout 30s memory 512MB nodejs24
end note
```

### 4. Leyendas

✅ **Bueno:**

```plantuml
legend right
  <b>Leyenda</b>
  |= Color |= Tipo de Servicio |
  |<#FF9900> | CDN y Monitoreo |
  |<#146EB4> | API y Base de Datos |
  |<#7AA116> | Compute (Lambda) |

  <b>Notas:</b>
  • Todos los servicios en AWS
  • Arquitectura serverless
  • Auto-escalado habilitado
endlegend
```

### 5. Títulos Descriptivos

✅ **Bueno:**

```plantuml
title AWS Architecture - Project Cost Control System\nServerless Architecture with Auto-Scaling
```

❌ **Malo:**

```plantuml
title Architecture
```

## Organización de Archivos

```
docs/diagrams/
├── README.md                          # Índice de todos los diagramas
├── DIAGRAM_BEST_PRACTICES.md         # Este archivo
├── architecture/
│   ├── README.md                      # Descripción de diagramas de arquitectura
│   ├── 01-aws-infrastructure.puml     # Infraestructura AWS
│   ├── 02-frontend-components.puml    # Componentes frontend
│   └── 03-use-cases.puml             # Casos de uso
├── data-model/
│   ├── README.md
│   ├── 01-database-schema.puml        # Esquema de base de datos
│   └── 02-data-pipeline.puml         # Pipeline de datos
├── flows/
│   ├── README.md
│   ├── 01-authentication.puml         # Flujo de autenticación
│   ├── 02-project-creation.puml       # Flujo de creación de proyecto
│   └── 03-time-entry.puml            # Flujo de entrada de tiempo
└── deployment/
    ├── README.md
    └── 01-deployment-process.puml     # Proceso de deployment
```

## Generación de Imágenes

### Usando PlantUML CLI

```bash
# Instalar PlantUML
brew install plantuml  # macOS
apt-get install plantuml  # Linux

# Generar PNG
plantuml diagram.puml

# Generar SVG (mejor calidad)
plantuml -tsvg diagram.puml

# Generar todos los diagramas en un directorio
plantuml "docs/diagrams/**/*.puml"
```

### Usando VS Code

1. Instalar extensión "PlantUML"
2. Abrir archivo .puml
3. Presionar `Alt+D` para preview
4. Click derecho > "Export Current Diagram"

## Checklist de Calidad

Antes de considerar un diagrama como "terminado", verifica:

- [ ] Tiene un título descriptivo
- [ ] Usa colores consistentes con el esquema definido
- [ ] Las conexiones tienen etiquetas claras
- [ ] Incluye notas explicativas donde sea necesario
- [ ] Tiene una leyenda si usa múltiples colores
- [ ] El flujo de lectura es claro (generalmente top-down o left-right)
- [ ] No está sobrecargado (máximo 15-20 elementos)
- [ ] Los nombres son descriptivos y consistentes
- [ ] Se puede entender sin contexto adicional
- [ ] La imagen generada es legible en tamaño normal

## Recursos Adicionales

- [PlantUML Official Documentation](https://plantuml.com/)
- [PlantUML Cheat Sheet](https://plantuml.com/guide)
- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- [C4 Model for Software Architecture](https://c4model.com/)

## Ejemplos de Referencia

Todos los diagramas en este proyecto siguen estas prácticas. Revisa:

- `docs/diagrams/architecture/01-aws-infrastructure.puml` - Arquitectura AWS completa
- `docs/diagrams/flows/01-authentication.puml` - Diagrama de secuencia
- `docs/diagrams/data-model/01-database-schema.puml` - ERD de base de datos
