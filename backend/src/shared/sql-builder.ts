/**
 * SQL Builder — Dynamic UPDATE query builder
 *
 * Eliminates repeated if-chain pattern for building SET clauses.
 */

import { ApiError } from "./response";

/**
 * A map of camelCase body field to snake_case column name.
 * Example: { costCodeId: 'cost_code_id', description: 'description' }
 */
type FieldMap = Record<string, string>;

/**
 * WHERE conditions as column to value pairs.
 * Example: { id: lineId, project_id: projectId }
 */
type WhereMap = Record<string, unknown>;

interface UpdateResult {
  sql: string;
  params: unknown[];
}

/**
 * Build a dynamic UPDATE query from a partial body object.
 *
 * Only includes fields that are !== undefined in the body.
 * Throws ApiError if no fields to update.
 */
export function buildUpdate(
  table: string,
  body: Record<string, unknown>,
  fieldMap: FieldMap,
  where: WhereMap,
  returning: string = "id",
): UpdateResult {
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [bodyKey, column] of Object.entries(fieldMap)) {
    if (body[bodyKey] !== undefined) {
      setClauses.push(column + " = $" + String(idx++));
      params.push(body[bodyKey]);
    }
  }

  if (setClauses.length === 0) {
    throw new ApiError("VALIDATION_ERROR", "No fields to update", 400);
  }

  const whereClauses: string[] = [];
  for (const [column, value] of Object.entries(where)) {
    whereClauses.push(column + " = $" + String(idx++));
    params.push(value);
  }

  const setStr = setClauses.join(", ");
  const whereStr = whereClauses.join(" AND ");
  const sql =
    "UPDATE " +
    table +
    " SET " +
    setStr +
    " WHERE " +
    whereStr +
    " RETURNING " +
    returning;
  return { sql, params };
}
