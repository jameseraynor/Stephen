#!/bin/bash
# create-migration.sh - Create a new migration file
# Usage: ./create-migration.sh <migration_name>

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Migration name required"
  echo "Usage: ./create-migration.sh <migration_name>"
  echo "Example: ./create-migration.sh add_status_to_employees"
  exit 1
fi

MIGRATIONS_DIR="database/migrations"
ROLLBACKS_DIR="database/rollbacks"

# Get next migration number
LAST_MIGRATION=$(ls -1 $MIGRATIONS_DIR/*.sql 2>/dev/null | tail -n 1 | grep -oP '\d+' | head -n 1)
if [ -z "$LAST_MIGRATION" ]; then
  NEXT_NUMBER="001"
else
  NEXT_NUMBER=$(printf "%03d" $((10#$LAST_MIGRATION + 1)))
fi

MIGRATION_NAME="$1"
MIGRATION_FILE="$MIGRATIONS_DIR/${NEXT_NUMBER}_${MIGRATION_NAME}.sql"
ROLLBACK_FILE="$ROLLBACKS_DIR/${NEXT_NUMBER}_${MIGRATION_NAME}.sql"

# Create migration file
cat > "$MIGRATION_FILE" << EOF
-- Migration: ${NEXT_NUMBER}_${MIGRATION_NAME}.sql
-- Description: TODO: Add description
-- Author: TODO: Add author
-- Date: $(date +%Y-%m-%d)

BEGIN;

-- TODO: Add migration SQL here

COMMIT;
EOF

# Create rollback file
cat > "$ROLLBACK_FILE" << EOF
-- Rollback: ${NEXT_NUMBER}_${MIGRATION_NAME}.sql
-- Description: Rollback for ${MIGRATION_NAME}
-- Date: $(date +%Y-%m-%d)

BEGIN;

-- TODO: Add rollback SQL here

COMMIT;
EOF

echo "✅ Migration files created:"
echo "   Migration: $MIGRATION_FILE"
echo "   Rollback:  $ROLLBACK_FILE"
echo ""
echo "📝 Next steps:"
echo "   1. Edit the migration file and add your SQL"
echo "   2. Edit the rollback file and add rollback SQL"
echo "   3. Run: ./database/scripts/migrate.sh $MIGRATION_FILE"
