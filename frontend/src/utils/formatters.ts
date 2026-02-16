/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as currency with decimals
 */
export function formatCurrencyDetailed(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage (31.5% format)
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0.0%";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format hours with 1 decimal place
 */
export function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number with commas
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0,
): string {
  if (value === null || value === undefined) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date as short date string (MM/DD/YYYY)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a date as month/year (Jan 2026)
 */
export function formatMonthYear(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
