import { Resend } from 'resend';

let _resend: Resend | null = null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@teslaprimecapital.com';

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY not configured');
    _resend = new Resend(key);
  }
  return _resend;
}

export async function sendVerificationEmail(to: string, otp: string, name?: string) {
  const greeting = name ? `Hi ${name}` : 'Hello';

  return getResend().emails.send({
    from: `Tesla Prime Capital <${FROM_EMAIL}>`,
    to,
    subject: 'Your Verification Code - Tesla Prime Capital',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #333">
        <div style="background:#CC0000;padding:24px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px">TESLA PRIME CAPITAL</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#e0e0e0;font-size:16px;margin:0 0 8px">${greeting},</p>
          <p style="color:#a0a0a0;font-size:14px;margin:0 0 24px;line-height:1.6">Your email verification code is below. Enter it to verify your account.</p>
          <div style="background:#222;border:2px dashed #CC0000;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px">
            <span style="font-size:32px;font-weight:bold;color:#fff;letter-spacing:8px;font-family:monospace">${otp}</span>
          </div>
          <p style="color:#666;font-size:12px;margin:0;line-height:1.5">This code expires in <strong style="color:#a0a0a0">10 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background:#151515;padding:16px 32px;text-align:center;border-top:1px solid #222">
          <p style="color:#444;font-size:11px;margin:0">&copy; ${new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const greeting = name ? `Dear ${name}` : 'Welcome';
  return getResend().emails.send({
    from: `Tesla Prime Capital <${FROM_EMAIL}>`,
    to,
    subject: 'Welcome to Tesla Prime Capital',
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #333">
        <div style="background:#CC0000;padding:24px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px">TESLA PRIME CAPITAL</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#e0e0e0;font-size:16px;margin:0 0 12px">${greeting},</p>
          <p style="color:#a0a0a0;font-size:14px;margin:0 0 24px;line-height:1.6">Your Tesla Prime Capital account has been successfully created and verified. You can now sign in and start your investment journey.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/login" style="background:#CC0000;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Sign In to Your Account</a>
          </div>
          <p style="color:#666;font-size:12px;margin:0;line-height:1.5">If you have any questions, our support team is available 24/7 through the chat widget on our platform.</p>
        </div>
        <div style="background:#151515;padding:16px 32px;text-align:center;border-top:1px solid #222">
          <p style="color:#444;font-size:11px;margin:0">&copy; ${new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendAdminNotificationEmail(to: string, name: string, options: {
  type: 'kyc_approved' | 'kyc_rejected' | 'deposit_confirmed' | 'deposit_rejected' | 'withdrawal_approved' | 'withdrawal_rejected';
  title: string;
  message: string;
  amount?: string;
  adminMessage?: string;
  attachmentUrl?: string;
}) {
  const { type, title, message, amount, adminMessage, attachmentUrl } = options;
  const greeting = name ? `Hi ${name}` : 'Hello';

  const typeConfig: Record<string, { color: string; icon: string }> = {
    kyc_approved: { color: '#22C55E', icon: '&#10003;' },
    kyc_rejected: { color: '#EF4444', icon: '&#10007;' },
    deposit_confirmed: { color: '#22C55E', icon: '&#10003;' },
    deposit_rejected: { color: '#EF4444', icon: '&#10007;' },
    withdrawal_approved: { color: '#22C55E', icon: '&#10003;' },
    withdrawal_rejected: { color: '#EF4444', icon: '&#10007;' },
  };
  const cfg = typeConfig[type] || { color: '#CC0000', icon: '&#9733;' };

  return getResend().emails.send({
    from: `Tesla Prime Capital <${FROM_EMAIL}>`,
    to,
    subject: `${title} — Tesla Prime Capital`,
    html: `
      <div style="max-width:480px;margin:0 auto;font-family:'Segoe UI',Arial,sans-serif;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #333">
        <div style="background:#CC0000;padding:24px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:1px">TESLA PRIME CAPITAL</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#e0e0e0;font-size:16px;margin:0 0 8px">${greeting},</p>
          <div style="text-align:center;margin:20px 0">
            <div style="width:48px;height:48px;border-radius:50%;background:${cfg.color}20;border:2px solid ${cfg.color};display:inline-flex;align-items:center;justify-content:center;font-size:24px;color:${cfg.color}">${cfg.icon}</div>
          </div>
          <h2 style="color:#fff;text-align:center;font-size:18px;margin:0 0 16px">${title}</h2>
          <p style="color:#a0a0a0;font-size:14px;margin:0 0 20px;line-height:1.6">${message}</p>
          ${amount ? `<div style="background:#222;border:2px dashed ${cfg.color};border-radius:8px;padding:16px;text-align:center;margin:0 0 20px"><span style="font-size:24px;font-weight:bold;color:#fff">${amount}</span></div>` : ''}
          ${adminMessage ? `
            <div style="background:#1e1108;border:1px solid #3d2a10;border-radius:8px;padding:16px;margin:0 0 20px">
              <p style="color:#F59E0B;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message from Tesla Prime Capital</p>
              <p style="color:#e0e0e0;font-size:14px;margin:0;line-height:1.6">${adminMessage}</p>
            </div>
          ` : ''}
          ${attachmentUrl ? `
            <div style="text-align:center;margin:0 0 20px">
              <a href="${attachmentUrl}" style="background:#333;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;display:inline-block;border:1px solid #444">&#128206; View Attachment</a>
            </div>
          ` : ''}
          <p style="color:#666;font-size:12px;margin:0;line-height:1.5">If you have any questions, contact our support team or visit your dashboard for more details.</p>
        </div>
        <div style="background:#151515;padding:16px 32px;text-align:center;border-top:1px solid #222">
          <p style="color:#444;font-size:11px;margin:0">&copy; ${new Date().getFullYear()} Tesla Prime Capital. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}