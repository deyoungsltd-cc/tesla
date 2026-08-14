import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { requireRole, apiResponse, apiError } from '@/lib/api-helpers';
import { z } from 'zod';

const broadcastSchema = z.object({
  userIds: z.array(z.string()).optional(),       // specific users
  allUsers: z.boolean().optional(),               // broadcast to all
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message body is required'),
  type: z.enum(['billing', 'announcement', 'custom', 'deposit_rejected', 'withdrawal_rejected', 'kyc_rejected']).default('custom'),
  sendEmail: z.boolean().default(true),
});

async function handler(request: NextRequest, _context: any, adminUser: any) {
  try {
    const body = await request.json();
    const parsed = broadcastSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { userIds, allUsers, subject, message, type, sendEmail } = parsed.data;

    // Determine recipient list
    let recipients: { id: string; email: string; name: string }[] = [];

    if (allUsers) {
      // Get all non-admin active users
      const adminIds = (await db.admin.findMany({ select: { userId: true } })).map(a => a.userId);
      const users = await db.user.findMany({
        where: { id: { notIn: adminIds }, status: 'active' },
        include: { profile: true },
      });
      recipients = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.profile ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim() : u.email,
      }));
    } else if (userIds && userIds.length > 0) {
      const users = await db.user.findMany({
        where: { id: { in: userIds } },
        include: { profile: true },
      });
      recipients = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.profile ? `${u.profile.firstName || ''} ${u.profile.lastName || ''}`.trim() : u.email,
      }));
    } else {
      return apiError('Provide userIds or set allUsers to true', 'VALIDATION_ERROR', 400);
    }

    if (recipients.length === 0) {
      return apiError('No recipients found', 'NOT_FOUND', 404);
    }

    // Create in-app notifications for all recipients
    await db.notification.createMany({
      data: recipients.map(r => ({
        userId: r.id,
        type: 'custom' as any,
        title: subject,
        message: message,
        actionUrl: type === 'billing' ? '/dashboard/deposit' : undefined,
      })),
    });

    // Send emails asynchronously (non-blocking)
    let emailSent = 0;
    let emailFailed = 0;
    if (sendEmail && recipients.length > 0) {
      const { sendAdminNotificationEmail } = await import('@/lib/email');
      const emailPromises = recipients.map(async (r) => {
        try {
          await sendAdminNotificationEmail(r.email, r.name, {
            type: 'deposit_confirmed' as any,
            title: subject,
            message: message,
            adminMessage: message,
          });
          emailSent++;
        } catch {
          emailFailed++;
        }
      });
      await Promise.allSettled(emailPromises);
    }

    return apiResponse({
      message: `Message sent to ${recipients.length} users`,
      recipients: recipients.length,
      emailsSent: emailSent,
      emailsFailed: emailFailed,
    });
  } catch (error) {
    console.error('Admin broadcast message error:', error);
    return apiError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

export const POST = requireRole('SUPER_ADMIN', 'ADMIN')(handler);
