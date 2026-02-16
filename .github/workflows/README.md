# GitHub Actions Workflows

Automated CI/CD pipelines for the Cost Control System.

## Workflows

### 1. Frontend CI (`frontend-ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches (frontend changes)
- Pull requests to `main` or `develop` (frontend changes)

**Jobs:**

1. **Lint & Type Check**
   - Run ESLint
   - Run TypeScript type check

2. **Test**
   - Run Vitest tests
   - Upload coverage to Codecov

3. **Build**
   - Build production bundle
   - Upload build artifacts

**Required Secrets:**

- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_IDENTITY_POOL_ID`
- `VITE_API_ENDPOINT`
- `VITE_AWS_REGION`
- `CODECOV_TOKEN` (optional)

---

### 2. Backend CI (`backend-ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches (backend changes)
- Pull requests to `main` or `develop` (backend changes)

**Jobs:**

1. **Lint & Type Check**
   - Run TypeScript type check

2. **Test**
   - Run Vitest tests
   - Upload coverage to Codecov

3. **Build**
   - Build Lambda functions
   - Upload build artifacts

**Required Secrets:**

- `CODECOV_TOKEN` (optional)

---

### 3. Infrastructure CI (`infrastructure-ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches (infrastructure changes)
- Pull requests to `main` or `develop` (infrastructure changes)

**Jobs:**

1. **Lint & Type Check**
   - Run TypeScript type check

2. **Test**
   - Run CDK tests

3. **CDK Synth**
   - Synthesize CloudFormation templates
   - Upload templates as artifacts

---

### 4. Deploy (`deploy.yml`)

**Triggers:**

- Manual workflow dispatch

**Inputs:**

- `environment`: Environment to deploy to (dev, staging, prod)
- `stacks`: CDK stacks to deploy (comma-separated or "all")

**Jobs:**

1. **Deploy Infrastructure**
   - Deploy CDK stacks to AWS
   - Upload CDK outputs

2. **Deploy Frontend**
   - Build React app
   - Upload to S3
   - Invalidate CloudFront cache

3. **Deploy Backend**
   - Build Lambda functions
   - Deploy via CDK

**Required Secrets:**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `VITE_USER_POOL_ID`
- `VITE_USER_POOL_CLIENT_ID`
- `VITE_IDENTITY_POOL_ID`
- `VITE_API_ENDPOINT`
- `VITE_AWS_REGION`
- `FRONTEND_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

**Environment Protection:**
Configure environment protection rules in GitHub:

- Settings → Environments → Create environment
- Add required reviewers for `prod`
- Add deployment branches for each environment

---

### 5. Generate Diagrams (`diagrams.yml`)

**Triggers:**

- Push to `main` or `develop` branches (diagram changes)
- Pull requests to `main` or `develop` (diagram changes)
- Manual workflow dispatch

**Jobs:**

1. **Generate PNG from PlantUML**
   - Install PlantUML
   - Generate PNG files from `.puml` files
   - Commit and push updated diagrams (on push)
   - Upload diagrams as artifacts (on PR)

**No secrets required**

---

### 6. Security Checks (`security.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Weekly schedule (Monday 00:00 UTC)
- Manual workflow dispatch

**Jobs:**

1. **Dependency Audit**
   - Run `npm audit` for frontend, backend, infrastructure
   - Upload audit reports

2. **CodeQL Analysis**
   - Static code analysis for JavaScript/TypeScript
   - Detect security vulnerabilities

3. **Secret Scanning**
   - Scan for leaked secrets using TruffleHog
   - Check commit history

**No secrets required** (uses GitHub token automatically)

---

## Setup Instructions

### 1. Configure GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

#### Required for CI:

```
CODECOV_TOKEN=<your-codecov-token>  # Optional
```

#### Required for Deployment:

```
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_REGION=us-east-1

VITE_USER_POOL_ID=<cognito-user-pool-id>
VITE_USER_POOL_CLIENT_ID=<cognito-client-id>
VITE_IDENTITY_POOL_ID=<cognito-identity-pool-id>
VITE_API_ENDPOINT=<api-gateway-endpoint>
VITE_AWS_REGION=us-east-1

FRONTEND_BUCKET_NAME=<s3-bucket-name>
CLOUDFRONT_DISTRIBUTION_ID=<cloudfront-distribution-id>
```

### 2. Configure Environments

Create environments for deployment protection:

1. Go to: Repository → Settings → Environments
2. Create environments: `dev`, `staging`, `prod`
3. For `prod`:
   - Add required reviewers
   - Set deployment branch to `main` only
4. For `staging`:
   - Set deployment branch to `develop` or `main`
5. For `dev`:
   - No restrictions

### 3. Configure Branch Protection

Go to: Repository → Settings → Branches

For `main` branch:

- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - frontend-ci / lint-and-typecheck
  - frontend-ci / test
  - frontend-ci / build
  - backend-ci / lint-and-typecheck
  - backend-ci / test
  - backend-ci / build
  - infrastructure-ci / lint-and-typecheck
  - infrastructure-ci / test
  - infrastructure-ci / cdk-synth
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

For `develop` branch:

- ✅ Require status checks to pass before merging
- ✅ Require conversation resolution before merging

### 4. Enable CodeQL

1. Go to: Repository → Settings → Code security and analysis
2. Enable: Dependency graph
3. Enable: Dependabot alerts
4. Enable: Dependabot security updates
5. Enable: Code scanning (CodeQL)

### 5. Configure Codecov (Optional)

1. Sign up at https://codecov.io
2. Add your repository
3. Get the upload token
4. Add `CODECOV_TOKEN` to GitHub secrets

---

## Usage

### Running CI

CI runs automatically on push and pull requests. No manual action required.

### Deploying

1. Go to: Actions → Deploy to AWS
2. Click "Run workflow"
3. Select:
   - Environment: `dev`, `staging`, or `prod`
   - Stacks: `all` or specific stacks (e.g., `ApiStack,FrontendStack`)
4. Click "Run workflow"

### Generating Diagrams

Diagrams are generated automatically when `.puml` files change.

To manually trigger:

1. Go to: Actions → Generate Diagrams
2. Click "Run workflow"
3. Click "Run workflow"

### Running Security Checks

Security checks run automatically weekly and on push/PR.

To manually trigger:

1. Go to: Actions → Security Checks
2. Click "Run workflow"
3. Click "Run workflow"

---

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![Frontend CI](https://github.com/jameseraynor/Stephen/workflows/Frontend%20CI/badge.svg)
![Backend CI](https://github.com/jameseraynor/Stephen/workflows/Backend%20CI/badge.svg)
![Infrastructure CI](https://github.com/jameseraynor/Stephen/workflows/Infrastructure%20CI/badge.svg)
![Security Checks](https://github.com/jameseraynor/Stephen/workflows/Security%20Checks/badge.svg)
```

---

## Troubleshooting

### Build Failures

1. Check the workflow logs in Actions tab
2. Verify all secrets are configured correctly
3. Ensure dependencies are up to date
4. Run the same commands locally to reproduce

### Deployment Failures

1. Check AWS credentials are valid
2. Verify IAM permissions for deployment
3. Check CDK stack status in CloudFormation console
4. Review CloudWatch Logs for Lambda errors

### Diagram Generation Failures

1. Verify PlantUML syntax is correct
2. Test locally with PlantUML
3. Check Java version compatibility

### Security Scan Failures

1. Review the security report
2. Update vulnerable dependencies
3. Remove any leaked secrets from history
4. Use `git filter-branch` or BFG Repo-Cleaner if needed

---

## Best Practices

### Commits

- Write clear commit messages
- Reference issue numbers
- Keep commits focused and atomic

### Pull Requests

- Create feature branches from `develop`
- Keep PRs small and focused
- Write descriptive PR descriptions
- Request reviews from team members
- Ensure all CI checks pass before merging

### Deployments

- Always deploy to `dev` first
- Test thoroughly in `dev` before promoting to `staging`
- Get approval before deploying to `prod`
- Monitor CloudWatch Logs after deployment
- Have a rollback plan ready

### Security

- Never commit secrets or credentials
- Use GitHub Secrets for sensitive data
- Review security scan results weekly
- Update dependencies regularly
- Enable Dependabot alerts

---

## Maintenance

### Weekly Tasks

- Review security scan results
- Update dependencies if needed
- Check for failed workflows
- Review CloudWatch Logs

### Monthly Tasks

- Review and update workflow configurations
- Check AWS costs
- Review IAM permissions
- Update documentation

### Quarterly Tasks

- Review and update branch protection rules
- Audit GitHub secrets
- Review deployment process
- Update Node.js version if needed

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [PlantUML Documentation](https://plantuml.com/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Codecov Documentation](https://docs.codecov.com/)
