#!/bin/bash
# migrate.sh - Run database migrations
# Usage: ./migrate.sh [migration_number]
# If no migration number provided, runs all migrations

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

MIGRATIONS_DIR="database/migrations"

echo "🔄 Running database migrations..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Function to run a single migration
run_migration() {
  local file=$1
  echo "▶ Running migration: $(basename $file)"
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file"
  if [ $? -eq 0 ]; then
    echo "✅ Migration completed: $(basename $file)"
  else
    echo "❌ Migration failed: $(basename $file)"
    exit 1
  fi
  echo ""
}

# If migration number provided, run specific migration
if [ ! -z "$1" ]; then
  MIGRATION_FILE="$MIGRATIONS_DIR/$1"
  if [ -f "$MIGRATION_FILE" ]; then
    run_migration "$MIGRATION_FILE"
  else
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
  fi
else
  # Run all migrations in order
  for file in $MIGRATIONS_DIR/*.sql; do
    if [ -f "$file" ]; then
      run_migration "$file"
    fi
  done
fi

echo "✅ All migrations completed successfully!"
