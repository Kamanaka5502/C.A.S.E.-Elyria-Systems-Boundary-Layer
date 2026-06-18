export async function sha256Hex(input) {
  const enc = new TextEncoder().encode(typeof input === 'string' ? input : JSON.stringify(input));
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function canonical(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

export function nowUtc() {
  return new Date().toISOString();
}
