import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

/**
 * Log a user-initiated action to the audit log.
 * Use this in client-facing API routes (deposits, withdrawals, investments, profile updates, etc.)
 * so admins can see all activity in the audit log, not just admin actions.
 */
export async function logUserAction(
  userId: string,
  action: string,
  options: {
    resource?: string;
    resourceId?: string;
    target?: string;
    details?: Record<string, unknown>;
    request?: NextRequest;
  } = {}
) {
  try {
    const { resource = '', resourceId, target, details, request } = options;
    const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request?.headers.get('x-real-ip')
      || undefined;
    const userAgent = request?.headers.get('user-agent') || undefined;

    await db.auditLog.create({
      data: {
        userId,
        adminId: null, // null = user-initiated, not admin
        action,
        resource,
        resourceId,
        target,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Non-blocking — don't fail the request if audit log fails
    console.error('[AUDIT LOG] Failed to log user action:', error);
  }
}
