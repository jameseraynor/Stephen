# CDK Stacks Review

## ✅ Síntesis Exitosa

Los 5 stacks de CDK se sintetizaron correctamente:

```bash
✅ cost-control-dev-network      (20.9 KB CloudFormation)
✅ cost-control-dev-database     (11.1 KB CloudFormation)
✅ cost-control-dev-auth         (6.2 KB CloudFormation)
✅ cost-control-dev-api          (6.8 KB CloudFormation)
✅ cost-control-dev-frontend     (16.2 KB CloudFormation)
```

## Cómo Revisar los Stacks

### 1. Ver el template CloudFormation de un stack específico

```bash
cd infrastructure

# Ver NetworkStack
npx cdk synth cost-control-dev-network

# Ver DatabaseStack
npx cdk synth cost-control-dev-database

# Ver AuthStack
npx cdk synth cost-control-dev-auth
```

### 2. Ver los recursos que se crearían

```bash
# Lista todos los recursos de todos los stacks
npx cdk synth --all | grep "Type: AWS::"

# O ver un stack específico
npx cdk synth cost-control-dev-network | grep "Type: AWS::"
```

### 3. Ver diferencias (si ya está desplegado)

```bash
# Ver qué cambiaría si despliegas
npx cdk diff cost-control-dev-network
```

## Resumen de Recursos por Stack

### NetworkStack

- **VPC** con 6 subnets (2 AZs × 3 tipos)
  - 2 Public subnets
  - 2 Private subnets (con NAT Gateway)
  - 2 Isolated subnets (sin internet)
- **1 NAT Gateway** (para cost optimization en dev)
- **2 Security Groups**:
  - Lambda Security Group
  - Database Security Group
- **1 VPC Endpoint** (Secrets Manager)
- **Internet Gateway**
- **Route Tables** y asociaciones

### DatabaseStack

- **Aurora Serverless v2 Cluster** (PostgreSQL 16.6)
  - Min capacity: 0.5 ACU
  - Max capacity: 1 ACU (dev)
  - 1 Writer instance
- **Secrets Manager Secret** (database credentials)
- **Security Group** para database
- **CloudWatch Log Group** (PostgreSQL logs)
- **Backup configuration** (7 días)

### AuthStack

- **Cognito User Pool**
  - Password policy (12+ chars, complex)
  - MFA opcional (TOTP)
  - Email sign-in
  - Advanced security mode
- **3 User Groups**:
  - Admin (precedence 1)
  - ProjectManager (precedence 2)
  - Viewer (precedence 3)
- **User Pool Client**
  - OAuth flows configurados
  - Token validity (1h access, 30d refresh)

### ApiStack

- **API Gateway REST API**
  - CORS configurado
  - Throttling (100 req/s, burst 200)
  - CloudWatch Logs
  - X-Ray tracing
- **CloudWatch Role** para API Gateway
- Nota: Lambda functions comentadas hasta que backend esté construido

### FrontendStack

- **S3 Bucket** (private)
  - Block all public access
  - S3-managed encryption
- **CloudFront Distribution**
  - HTTPS only
  - SPA routing (404 → index.html)
  - Gzip compression
  - Price Class 100 (dev)
- **Origin Access Identity**
- **S3 Deployment** (config.json)

## Warnings (No Críticos)

Los warnings que ves son normales:

1. **advancedSecurityMode deprecated**: AWS recomienda usar los nuevos modos de protección. Podemos actualizar después.

2. **S3Origin deprecated**: AWS recomienda usar `S3BucketOrigin`. Podemos actualizar después.

3. **CDK telemetry**: Información sobre telemetría de CDK CLI. Puedes deshabilitarlo con:
   ```bash
   cdk acknowledge 34892
   ```

## Próximos Pasos para Desplegar

### Opción 1: Desplegar Todo (Recomendado para primera vez)

```bash
# 1. Configurar AWS credentials
export AWS_PROFILE=your-profile
# o
aws configure

# 2. Bootstrap CDK (solo primera vez)
npx cdk bootstrap

# 3. Desplegar todos los stacks
npx cdk deploy --all

# Te pedirá confirmación para cada stack
# Revisa los cambios y confirma con 'y'
```

### Opción 2: Desplegar Stack por Stack

```bash
# 1. Network (sin dependencias)
npx cdk deploy cost-control-dev-network

# 2. Database (depende de Network)
npx cdk deploy cost-control-dev-database

# 3. Auth (sin dependencias)
npx cdk deploy cost-control-dev-auth

# 4. API (depende de Network, Database, Auth)
npx cdk deploy cost-control-dev-api

# 5. Frontend (depende de Auth, API)
npx cdk deploy cost-control-dev-frontend
```

### Opción 3: Solo Revisar (Sin Desplegar)

```bash
# Ver qué se crearía sin desplegar
npx cdk synth --all > review.yaml

# Ver costos estimados (requiere AWS Cost Explorer)
# No disponible en CDK directamente, pero puedes usar:
# https://calculator.aws/
```

## Costos Estimados (Dev Environment)

Basado en la configuración actual:

- **VPC**: Gratis (solo NAT Gateway cobra)
- **NAT Gateway**: ~$32/mes + data transfer
- **Aurora Serverless v2**: ~$43/mes (0.5 ACU × 24h × 30d × $0.12/ACU-hour)
- **Cognito**: Gratis (primeros 50,000 MAU)
- **API Gateway**: Gratis (primer millón de requests)
- **Lambda**: Gratis (primer millón de requests)
- **S3**: ~$0.50/mes (storage mínimo)
- **CloudFront**: Gratis (primer TB de data transfer)

**Total estimado**: ~$75-80/mes para dev

Para reducir costos en dev:

- Apagar Aurora cuando no se use
- Usar VPC sin NAT Gateway (acceso público temporal)
- Usar LocalStack para desarrollo local

## Verificar Antes de Desplegar

- [ ] AWS credentials configuradas
- [ ] Región correcta (us-east-1 por defecto)
- [ ] Presupuesto AWS configurado (opcional pero recomendado)
- [ ] Revisar los templates generados
- [ ] Entender los costos estimados

## Comandos Útiles

```bash
# Ver todos los stacks
npx cdk list

# Ver template de un stack
npx cdk synth cost-control-dev-network

# Ver diferencias (si ya está desplegado)
npx cdk diff

# Destruir todos los stacks (¡CUIDADO!)
npx cdk destroy --all

# Ver metadata de los stacks
npx cdk metadata
```

## Notas Importantes

1. **Lambda Functions**: Están comentadas en ApiStack porque el backend no está construido aún. Las descomentaremos cuando tengamos el código Lambda listo.

2. **Cognito Authorizer**: También comentado temporalmente. Se activará cuando tengamos las Lambda functions.

3. **Database**: Aurora Serverless v2 puede escalar a 0.5 ACU cuando está idle, pero no a 0. Siempre hay un costo base.

4. **Deletion Protection**: Deshabilitada en dev para facilitar pruebas. En prod estará habilitada.

5. **Backups**: 7 días en dev, 30 días en prod.

## Troubleshooting

### Error: "Unable to resolve AWS account"

```bash
aws sts get-caller-identity
# Verifica que tus credentials estén configuradas
```

### Error: "CDK bootstrap required"

```bash
npx cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Error: "Stack already exists"

```bash
# Ver el stack existente
npx cdk diff cost-control-dev-network

# Destruir y recrear
npx cdk destroy cost-control-dev-network
npx cdk deploy cost-control-dev-network
```

## Siguiente Paso

Una vez revisados los stacks, puedes:

1. **Desplegar la infraestructura** (si tienes AWS configurado)
2. **Continuar con el punto 5**: Componentes UI Base (shadcn/ui)
3. **Continuar con el punto 7**: Lambda Functions Scaffold

¿Qué prefieres hacer?
