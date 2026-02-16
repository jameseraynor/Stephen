#!/bin/bash
# seed-db.sh - Seed database with development data
# Usage: ./seed-db.sh

set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-costcontrol}
DB_USER=${DB_USER:-postgres}

SEEDS_DIR="database/seeds"

echo "🌱 Seeding database with development data..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Function to run a seed file
run_seed() {
  local file=$1
  echo "▶ Running seed: $(basename $file)"
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"
  if [ $? -eq 0 ]; then
    echo "✅ Seed completed: $(basename $file)"
  else
    echo "❌ Seed failed: $(basename $file)"
    exit 1
  fi
  echo ""
}

# Run all seed files in order
for file in $SEEDS_DIR/*.sql; do
  if [ -f "$file" ]; then
    run_seed "$file"
  fi
done

echo "✅ Database seeded successfully!"
