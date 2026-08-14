import { Prisma } from '@prisma/client';

/**
 * Recursively convert all Prisma Decimal values in an object to plain numbers.
 * This ensures JSON serialization works correctly for API responses.
 */
export function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'boolean') return obj;

  // Handle Prisma Decimal objects
  if (Prisma && Prisma.Decimal && (obj as any) instanceof Prisma.Decimal) {
    return (obj as any).toNumber() as unknown as T;
  }

  // Handle Date objects
  if (obj instanceof Date) return obj;

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimals) as unknown as T;
  }

  // Handle plain objects
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeDecimals((obj as Record<string, unknown>)[key]);
      }
    }
    return result as unknown as T;
  }

  return obj;
}
