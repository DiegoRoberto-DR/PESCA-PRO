/**
 * Anti-Hacker, Anti-Fraud & Data Protection Security Suite
 * FISGADA PRO - Enterprise Security Module
 */

/**
 * Strips dangerous HTML tags and script injections to prevent Cross-Site Scripting (XSS)
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';
  return String(input)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '') // strip direct brackets
    .trim();
}

/**
 * Escapes HTML characters for safe text rendering
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and sanitizes standard safe identifiers (alphanumeric, dashes, underscores)
 */
export function isValidSafeId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.length > 128) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(id);
}

/**
 * Masks CPF (e.g. 123.***.***-45) to protect user identity against data scraping / theft
 */
export function maskCPF(cpf: string | null | undefined): string {
  if (!cpf) return '***.***.***-**';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length < 11) return '***.***.***-**';
  return `${clean.slice(0, 3)}.***.***-${clean.slice(9, 11)}`;
}

/**
 * Masks user email (e.g. jo***@gmail.com) for safe public rendering
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user.slice(0, 1)}***@${domain}`;
  }
  return `${user.slice(0, 2)}***@${domain}`;
}

/**
 * Masks phone numbers (e.g. (19) 9****-1234)
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '(**) *****-****';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return '(**) *****-****';
  return `(${clean.slice(0, 2)}) 9****-${clean.slice(-4)}`;
}

/**
 * Cryptographic validation of Brazilian CPF numbers
 */
export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  
  // Reject repetitive numbers (e.g. 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10), 10)) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11), 10)) return false;

  return true;
}

/**
 * Simple client-side action rate limiter to protect against spam / script injection
 */
const clientActionTimestamps = new Map<string, number>();

export function checkActionRateLimit(actionKey: string, cooldownMs: number = 2000): { allowed: boolean; waitMs: number } {
  const now = Date.now();
  const lastTime = clientActionTimestamps.get(actionKey) || 0;
  const diff = now - lastTime;

  if (diff < cooldownMs) {
    return { allowed: false, waitMs: cooldownMs - diff };
  }

  clientActionTimestamps.set(actionKey, now);
  return { allowed: true, waitMs: 0 };
}
