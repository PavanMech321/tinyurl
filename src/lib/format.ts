export function truncate(str: string, max = 64): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

export function isoOrDash(d?: Date | string | null): string {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleString();
}