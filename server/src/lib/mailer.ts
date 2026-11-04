import type { Env } from '../config/env.js';

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface Mailer {
  readonly driver: 'resend' | 'console' | 'memory';
  send(email: Email): Promise<void>;
}

/** Sends through the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email). */
export class ResendMailer implements Mailer {
  readonly driver = 'resend' as const;
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(email: Email): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [email.to], subject: email.subject, html: email.html, text: email.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
    }
  }
}

/** Dev fallback without RESEND_API_KEY: prints the email (and its links) to the server log. */
export class ConsoleMailer implements Mailer {
  readonly driver = 'console' as const;
  async send(email: Email): Promise<void> {
    console.log(`[mail] to=${email.to} subject="${email.subject}"\n${email.text}\n`);
  }
}

/** Keeps sent emails in memory; used by tests. */
export class MemoryMailer implements Mailer {
  readonly driver = 'memory' as const;
  readonly sent: Email[] = [];
  async send(email: Email): Promise<void> {
    this.sent.push(email);
  }
  /** Most recent email to `to`, if any. */
  last(to: string): Email | undefined {
    return this.sent.filter((e) => e.to === to).at(-1);
  }
}

export function createMailer(env: Pick<Env, 'RESEND_API_KEY' | 'EMAIL_FROM'>): Mailer {
  return env.RESEND_API_KEY ? new ResendMailer(env.RESEND_API_KEY, env.EMAIL_FROM) : new ConsoleMailer();
}
