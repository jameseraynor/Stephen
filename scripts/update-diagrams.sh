#!/bin/bash

# Script to update PNG images from PlantUML diagrams
# Usage: ./scripts/update-diagrams.sh

set -e

echo "========================================="
echo "PlantUML Diagram Updater"
echo "========================================="
echo ""

# Check if PlantUML is installed
if ! command -v plantuml &> /dev/null; then
    echo "❌ Error: PlantUML is not installed"
    echo ""
    echo "Install PlantUML:"
    echo "  macOS:   brew install plantuml"
    echo "  Linux:   apt-get install plantuml"
    echo "  Windows: choco install plantuml"
    echo ""
    exit 1
fi

echo "✅ PlantUML found: $(plantuml -version | head -n 1)"
echo ""

# Count .puml files
TOTAL_FILES=$(find docs/diagrams -name "*.puml" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL_FILES PlantUML files"
echo ""

# Generate PNG images
echo "🖼️  Generating PNG images..."
plantuml "docs/diagrams/**/*.puml" 2>&1 | grep -v "Warning" || true
echo "✅ PNG images generated"
echo ""

# Rename files to match .puml filenames
echo "📝 Renaming PNG files..."

# Architecture
if [ -f "docs/diagrams/architecture/AWS Architecture.png" ]; then
    mv "docs/diagrams/architecture/AWS Architecture.png" "docs/diagrams/architecture/01-aws-infrastructure.png"
    echo "  ✓ Renamed AWS Architecture.png"
fi

if [ -f "docs/diagrams/architecture/Frontend Component Structure.png" ]; then
    mv "docs/diagrams/architecture/Frontend Component Structure.png" "docs/diagrams/architecture/02-frontend-components.png"
    echo "  ✓ Renamed Frontend Component Structure.png"
fi

if [ -f "docs/diagrams/architecture/Use Cases.png" ]; then
    mv "docs/diagrams/architecture/Use Cases.png" "docs/diagrams/architecture/03-use-cases.png"
    echo "  ✓ Renamed Use Cases.png"
fi

# Data Model
if [ -f "docs/diagrams/data-model/Database ERD.png" ]; then
    mv "docs/diagrams/data-model/Database ERD.png" "docs/diagrams/data-model/01-database-schema.png"
    echo "  ✓ Renamed Database ERD.png"
fi

if [ -f "docs/diagrams/data-model/Data Flow.png" ]; then
    mv "docs/diagrams/data-model/Data Flow.png" "docs/diagrams/data-model/02-data-pipeline.png"
    echo "  ✓ Renamed Data Flow.png"
fi

# Flows
if [ -f "docs/diagrams/flows/Authentication Flow.png" ]; then
    mv "docs/diagrams/flows/Authentication Flow.png" "docs/diagrams/flows/01-authentication.png"
    echo "  ✓ Renamed Authentication Flow.png"
fi

if [ -f "docs/diagrams/flows/Project Creation Flow.png" ]; then
    mv "docs/diagrams/flows/Project Creation Flow.png" "docs/diagrams/flows/02-project-creation.png"
    echo "  ✓ Renamed Project Creation Flow.png"
fi

if [ -f "docs/diagrams/flows/Daily Time Entry Flow.png" ]; then
    mv "docs/diagrams/flows/Daily Time Entry Flow.png" "docs/diagrams/flows/03-time-entry.png"
    echo "  ✓ Renamed Daily Time Entry Flow.png"
fi

# Deployment
if [ -f "docs/diagrams/deployment/Deployment Diagram.png" ]; then
    mv "docs/diagrams/deployment/Deployment Diagram.png" "docs/diagrams/deployment/01-deployment-process.png"
    echo "  ✓ Renamed Deployment Diagram.png"
fi

echo ""
echo "✅ All files renamed"
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
PNG_COUNT=$(find docs/diagrams -name "*.png" | wc -l | tr -d ' ')
echo "Total PNG files: $PNG_COUNT"
echo ""

# List all PNG files
echo "Generated PNG files:"
find docs/diagrams -name "*.png" -type f | sort | sed 's/^/  ✓ /'

echo ""
echo "========================================="
echo "✅ All diagrams updated successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Review the generated PNG files"
echo "  2. Commit changes: git add docs/diagrams/**/*.png"
echo "  3. Commit: git commit -m 'Update diagram images'"
echo ""
