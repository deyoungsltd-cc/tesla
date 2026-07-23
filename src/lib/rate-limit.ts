import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (replace with Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 60; // per window
const STRICT_MAX_REQUESTS = 5; // for auth routes

export function rateLimit(request: NextRequest, strict = false): { success: boolean; remaining: number; resetTime: number } {
  // Prefer forwarded IP for proxy/Railway setups
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  
  const key = `${ip}:${strict ? 'strict' : 'normal'}`;
  const now = Date.now();
  const max = strict ? STRICT_MAX_REQUESTS : MAX_REQUESTS;

  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true, remaining: max - 1, resetTime: now + WINDOW_MS };
  }

  if (record.count >= max) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: max - record.count, resetTime: record.resetTime };
}

// Cleanup old entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function withRateLimit(handler: Function, strict = false) {
  return async (request: NextRequest, context?: any) => {
    const { success, remaining, resetTime } = rateLimit(request, strict);
    
    const response = await handler(request, context);
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          }
        }
      );
    }
    
    return response;
  };
}
