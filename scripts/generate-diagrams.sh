#!/bin/bash

# Script to generate PNG and SVG images from PlantUML diagrams
# Usage: ./scripts/generate-diagrams.sh

set -e

echo "========================================="
echo "PlantUML Diagram Generator"
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

# Navigate to diagrams directory
cd "$(dirname "$0")/../docs/diagrams" || exit 1

echo "📁 Working directory: $(pwd)"
echo ""

# Count total .puml files
TOTAL_FILES=$(find . -name "*.puml" | wc -l | tr -d ' ')
echo "📊 Found $TOTAL_FILES PlantUML files"
echo ""

# Generate PNG images
echo "🖼️  Generating PNG images..."
plantuml "**/*.puml" 2>&1 | grep -v "Warning" || true
PNG_COUNT=$(find . -name "*.png" -newer . 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Generated PNG images"
echo ""

# Generate SVG images
echo "🎨 Generating SVG images..."
plantuml -tsvg "**/*.puml" 2>&1 | grep -v "Warning" || true
SVG_COUNT=$(find . -name "*.svg" -newer . 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Generated SVG images"
echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo "Total .puml files:  $TOTAL_FILES"
echo "PNG images:         $(find . -name "*.png" | wc -l | tr -d ' ')"
echo "SVG images:         $(find . -name "*.svg" | wc -l | tr -d ' ')"
echo ""

# List generated files by category
echo "Generated files by category:"
echo ""

echo "📐 Architecture:"
find architecture -name "*.png" -o -name "*.svg" | sort

echo ""
echo "🗄️  Data Model:"
find data-model -name "*.png" -o -name "*.svg" | sort

echo ""
echo "🔄 Flows:"
find flows -name "*.png" -o -name "*.svg" | sort

echo ""
echo "🚀 Deployment:"
find deployment -name "*.png" -o -name "*.svg" | sort

echo ""
echo "========================================="
echo "✅ All diagrams generated successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Review generated images"
echo "  2. Commit images to repository"
echo "  3. Update documentation with image links"
echo ""
