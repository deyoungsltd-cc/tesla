import { type NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateBody, sanitize } from '@/lib/validation';

// Apply rate limiting + validation to auth routes (register, login)
export async function POST(request: NextRequest) {
  // STRICT rate limit for auth (5 req/min)
  const { success } = rateLimit(request, true);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 1 minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate
  const { valid, errors } = validateBody(body, {
    email: { type: 'email', required: true, message: 'Valid email is required' },
    password: { type: 'string', required: true, min: 8, message: 'Password must be at least 8 characters' },
  });

  if (!valid) {
    return NextResponse.json({ error: errors[0] }, { status: 422 });
  }

  // Continue to actual auth logic...
  return NextResponse.json({ ok: true });
}
