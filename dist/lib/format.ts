export function truncate(str, max = 64) {
    if (str.length <= max)
        return str;
    return str.slice(0, max - 1) + '…';
}
export function isoOrDash(d) {
    if (!d)
        return '—';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleString();
}
