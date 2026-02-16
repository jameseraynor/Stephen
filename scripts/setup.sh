#!/bin/bash

# Project Cost Control System - Setup Script
# This script sets up the development environment

set -e  # Exit on error

echo "🚀 Setting up Project Cost Control System..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION installed"
else
    print_error "Node.js is not installed"
    echo "Please install Node.js v20.x or higher from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION installed"
else
    print_error "npm is not installed"
    exit 1
fi

# Check AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version | cut -d' ' -f1)
    print_success "$AWS_VERSION installed"
else
    print_warning "AWS CLI is not installed (optional for local development)"
    echo "Install from: https://aws.amazon.com/cli/"
fi

# Check AWS CDK
if command -v cdk &> /dev/null; then
    CDK_VERSION=$(cdk --version)
    print_success "AWS CDK $CDK_VERSION installed"
else
    print_warning "AWS CDK is not installed"
    echo "Install with: npm install -g aws-cdk"
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "$GIT_VERSION installed"
else
    print_error "Git is not installed"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
if [ -d "frontend" ]; then
    print_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
else
    print_warning "Frontend directory not found, skipping..."
fi

# Install backend dependencies
if [ -d "backend" ]; then
    print_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
else
    print_warning "Backend directory not found, skipping..."
fi

# Install infrastructure dependencies
if [ -d "infrastructure" ]; then
    print_info "Installing infrastructure dependencies..."
    cd infrastructure
    npm install
    cd ..
    print_success "Infrastructure dependencies installed"
else
    print_warning "Infrastructure directory not found, skipping..."
fi

echo ""
echo "📝 Setting up environment files..."
echo ""

# Setup frontend environment
if [ -d "frontend" ] && [ -f "frontend/.env.example" ]; then
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        print_success "Created frontend/.env from template"
        print_warning "Remember to update frontend/.env with your AWS resource IDs after deployment"
    else
        print_info "frontend/.env already exists, skipping..."
    fi
fi

# Setup infrastructure context
if [ -d "infrastructure" ] && [ -f "infrastructure/cdk.context.example.json" ]; then
    if [ ! -f "infrastructure/cdk.context.json" ]; then
        cp infrastructure/cdk.context.example.json infrastructure/cdk.context.json
        print_success "Created infrastructure/cdk.context.json from template"
    else
        print_info "infrastructure/cdk.context.json already exists, skipping..."
    fi
fi

echo ""
echo "🔧 Setting up Git hooks..."
echo ""

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Check if frontend directory exists
if [ -d "frontend" ]; then
    cd frontend
    
    # Run type check
    echo "Type checking frontend..."
    npm run type-check
    if [ $? -ne 0 ]; then
        echo "Type check failed. Commit aborted."
        exit 1
    fi
    
    # Run linter
    echo "Linting frontend..."
    npm run lint
    if [ $? -ne 0 ]; then
        echo "Linting failed. Commit aborted."
        exit 1
    fi
    
    cd ..
fi

# Check if backend directory exists
if [ -d "backend" ]; then
    cd backend
    
    # Run type check
    echo "Type checking backend..."
    npm run type-check
    if [ $? -ne 0 ]; then
        echo "Type check failed. Commit aborted."
        exit 1
    fi
    
    cd ..
fi

echo "Pre-commit checks passed!"
exit 0
EOF

chmod +x .git/hooks/pre-commit
print_success "Git pre-commit hook installed"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Deploy infrastructure:"
echo "   cd infrastructure"
echo "   cdk bootstrap  # First time only"
echo "   npm run cdk deploy --all"
echo ""
echo "2. Update frontend/.env with AWS resource IDs from CDK outputs"
echo ""
echo "3. Initialize database:"
echo "   cd database"
echo "   ./scripts/migrate.sh"
echo ""
echo "4. Create first user:"
echo "   aws cognito-idp admin-create-user \\"
echo "     --user-pool-id <YOUR_USER_POOL_ID> \\"
echo "     --username admin@example.com \\"
echo "     --user-attributes Name=email,Value=admin@example.com \\"
echo "     --temporary-password TempPassword123!"
echo ""
echo "5. Start frontend development server:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "📖 For more information, see README.md"
echo ""
