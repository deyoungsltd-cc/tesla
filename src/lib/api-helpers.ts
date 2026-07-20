import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getSessionUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true, adminRecord: true },
  });

  if (!user || user.deletedAt || user.status === 'banned') return null;
  return user;
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
    }
    return handler(request, context, user);
  };
}

export function requireRole(...roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      const user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 });
      }
      if (user.adminRecord && !roles.includes(user.adminRecord.role)) {
        return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, { status: 403 });
      }
      if (!user.adminRecord && roles.length > 0) {
        return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 });
      }
      return handler(request, context, user);
    };
  };
}

export async function apiResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, code: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}