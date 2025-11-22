const CODE_REGEX = /^[a-z0-9\-]{3,32}$/;

export function isValidCode(code: string): boolean {
  return CODE_REGEX.test(code);
}

export function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // Only allow http/https
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}