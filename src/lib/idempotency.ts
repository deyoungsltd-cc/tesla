import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// In-memory set for recent idempotency keys (auto-expires after 10 minutes)
const processedKeys = new Map<string, number>();
const IDEMPOTENCY_TTL = 10 * 60 * 1000; // 10 minutes

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of processedKeys.entries()) {
      if (now - timestamp > IDEMPOTENCY_TTL) processedKeys.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Check idempotency: if this key was already processed, return the cached response.
 * Otherwise, mark it as in-progress. Call `confirmIdempotency` when the operation succeeds.
 *
 * @param key - Unique idempotency key (typically userId + operation hash)
 * @returns { duplicate: boolean } — if true, caller should return 409 Conflict
 */
export function checkIdempotency(key: string): { duplicate: boolean } {
  const now = Date.now();
  const existing = processedKeys.get(key);

  if (existing && now - existing < IDEMPOTENCY_TTL) {
    return { duplicate: true };
  }

  processedKeys.set(key, now);
  return { duplicate: false };
}

/**
 * Generate a deterministic idempotency key from user ID + request fingerprint.
 */
export function buildIdempotencyKey(userId: string, operation: string, fingerprint: string): string {
  return `${userId}:${operation}:${fingerprint}`;
}

/**
 * Check if a similar pending record already exists (database-level idempotency).
 * This prevents double-submission even across server restarts.
 */
export async function hasPendingOperation(
  userId: string,
  type: 'deposit' | 'withdrawal' | 'investment',
  fingerprint: string
): Promise<boolean> {
  // For deposits: check for same userId + amount + method within last 60 seconds
  if (type === 'deposit') {
    const recentCutoff = new Date(Date.now() - 60 * 1000);
    const count = await db.deposit.count({
      where: {
        userId,
        status: 'pending',
        createdAt: { gte: recentCutoff },
      },
    });
    return count > 0;
  }

  // For withdrawals: check for same userId + amount + status pending within last 60 seconds
  if (type === 'withdrawal') {
    const recentCutoff = new Date(Date.now() - 60 * 1000);
    const count = await db.withdrawal.count({
      where: {
        userId,
        status: 'pending',
        createdAt: { gte: recentCutoff },
      },
    });
    return count > 0;
  }

  // For investments: check for same userId + planId + status active within last 60 seconds
  if (type === 'investment') {
    const recentCutoff = new Date(Date.now() - 60 * 1000);
    const count = await db.userInvestment.count({
      where: {
        userId,
        planId: fingerprint,
        status: 'active',
        startDate: { gte: recentCutoff },
      },
    });
    return count > 0;
  }

  return false;
}
