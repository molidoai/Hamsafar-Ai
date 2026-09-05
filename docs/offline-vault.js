const SALT_KEY = "hamsafar_vault_salt";
const VAULT_KEY = "hamsafar_vault";

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function unb64(s) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}
async function derive(pin, salt) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
export async function lockVault(pin, data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(data)));
  localStorage.setItem(SALT_KEY, b64(salt));
  localStorage.setItem(VAULT_KEY, JSON.stringify({ iv: b64(iv), data: b64(cipher) }));
  ["hamsafar_trips", "hamsafar_sos", "hamsafar_family"].forEach((k) => localStorage.removeItem(k));
}
export async function unlockVault(pin) {
  const raw = localStorage.getItem(VAULT_KEY);
  const saltRaw = localStorage.getItem(SALT_KEY);
  if (!raw || !saltRaw) return null;
  const pack = JSON.parse(raw);
  const key = await derive(pin, unb64(saltRaw));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(pack.iv) }, key, unb64(pack.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
