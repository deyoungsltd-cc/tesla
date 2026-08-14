import { NextRequest } from 'next/server';

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

export function isCaptchaConfigured(): boolean {
  return !!TURNSTILE_SECRET && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}

export async function verifyCaptcha(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
  if (!TURNSTILE_SECRET) {
    // Graceful degradation: if no secret configured, skip verification
    return { success: true };
  }

  try {
    const body = new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    });

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();

    if (data.success) {
      return { success: true };
    }

    const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'Unknown error';
    console.error('[CAPTCHA] Verification failed:', errorCodes);
    return { success: false, error: `CAPTCHA verification failed: ${errorCodes}` };
  } catch (error: any) {
    console.error('[CAPTCHA] Verification request failed:', error?.message || error);
    return { success: false, error: 'CAPTCHA verification request failed' };
  }
}

export function shouldVerifyCaptcha(request: NextRequest): boolean {
  return isCaptchaConfigured();
}
