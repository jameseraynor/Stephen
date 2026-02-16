#!/bin/bash
# rollback.sh - Rollback database migrations
# Usage: ./rollback.sh <migration_number>

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Migration number required"
  echo "Usage: ./rollback.sh <migration_number>"
  echo "Example: ./rollback.sh 002_create_projects_table.sql"
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-costcontrol}
DB_USER=${DB_USER:-postgres}

ROLLBACK_FILE="database/rollbacks/$1"

if [ ! -f "$ROLLBACK_FILE" ]; then
  echo "❌ Rollback file not found: $ROLLBACK_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will rollback migration: $1"
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

echo ""
echo "🔄 Running rollback..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$ROLLBACK_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Rollback completed successfully"
else
  echo "❌ Rollback failed"
  exit 1
fi
