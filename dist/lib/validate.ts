const CODE_REGEX = /^[a-z0-9\-]{3,32}$/;
export function isValidCode(code) {
    return CODE_REGEX.test(code);
}
export function normalizeCode(code) {
    return code.trim().toLowerCase();
}
export function isValidUrl(url) {
    try {
        const u = new URL(url);
        // Only allow http/https
        return ['http:', 'https:'].includes(u.protocol);
    }
    catch {
        return false;
    }
}
