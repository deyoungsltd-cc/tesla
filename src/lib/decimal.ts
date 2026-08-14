import { Prisma } from '@prisma/client';

/**
 * Safely convert a Prisma Decimal (or number) to a plain JavaScript number.
 * Use this for arithmetic, comparisons, and JSON serialization of money values.
 */
export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  // Prisma.Decimal instance — call toNumber() from decimal.js
  return (value as any).toNumber ? (value as any).toNumber() : Number(value);
}

/**
 * Format a money value to 2 decimal places (e.g., "150.00").
 * Safe for Prisma Decimal, number, or string inputs.
 */
export function formatMoney(value: Prisma.Decimal | number | null | undefined): string {
  return toNumber(value).toFixed(2);
}
