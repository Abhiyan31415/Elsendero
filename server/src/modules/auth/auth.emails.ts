import type { Email } from '../../lib/mailer.js';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

function layout(heading: string, intro: string, buttonText: string, link: string, footer: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933">
  <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px">
    <tr><td>
      <h1 style="font-size:20px;margin:0 0 16px">${heading}</h1>
      <p style="font-size:15px;line-height:1.5;margin:0 0 24px">${intro}</p>
      <p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#1976d2;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">${buttonText}</a></p>
      <p style="font-size:13px;line-height:1.5;color:#52606d;margin:0 0 8px">Or paste this link into your browser:<br><a href="${link}" style="color:#1976d2;word-break:break-all">${link}</a></p>
      <p style="font-size:13px;line-height:1.5;color:#52606d;margin:16px 0 0">${footer}</p>
    </td></tr>
  </table>
</body></html>`;
}

export function verificationEmail(to: string, name: string, link: string): Email {
  const who = escapeHtml(name);
  return {
    to,
    subject: 'Verify your Gantabya email',
    html: layout(
      `Welcome to Gantabya, ${who}!`,
      'Please confirm your email address to finish setting up your account.',
      'Verify email',
      link,
      "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    ),
    text: `Welcome to Gantabya, ${name}!\n\nConfirm your email address by opening this link:\n${link}\n\nThis link expires in 24 hours. If you didn't create an account, you can ignore this email.`,
  };
}

export function passwordResetEmail(to: string, name: string, link: string): Email {
  const who = escapeHtml(name);
  return {
    to,
    subject: 'Reset your Gantabya password',
    html: layout(
      `Hi ${who},`,
      'We received a request to reset your password. Click the button below to choose a new one.',
      'Reset password',
      link,
      "This link expires in 1 hour and can be used once. If you didn't ask for this, you can ignore this email; your password won't change.",
    ),
    text: `Hi ${name},\n\nReset your password by opening this link:\n${link}\n\nThis link expires in 1 hour and can be used once. If you didn't ask for this, ignore this email; your password won't change.`,
  };
}
