const SALT_KEY = "hamsafar_vault_salt";
const VAULT_KEY = "hamsafar_vault";
export const DATA_KEYS = [
  "hamsafar_trips","hamsafar_sos","hamsafar_family","hamsafar_edition",
  "hamsafar_journal","hamsafar_check","hamsafar_exp","hamsafar_roads","hamsafar_contacts"
];

function b64(buf) {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
}
function unb64(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
async function derive(pin, salt) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
export function snapshot() {
  const data = {};
  DATA_KEYS.forEach((k) => { data[k] = localStorage.getItem(k); });
  return data;
}
export async function lockVault(pin, data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(data)));
  localStorage.setItem(SALT_KEY, b64(salt));
  localStorage.setItem(VAULT_KEY, JSON.stringify({ v: 2, kdf: "pbkdf2-sha256", iter: 210000, iv: b64(iv), data: b64(cipher) }));
  DATA_KEYS.forEach((k) => localStorage.removeItem(k));
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
export function restore(data) {
  if (!data) return;
  DATA_KEYS.forEach((k) => {
    if (data[k] != null) localStorage.setItem(k, data[k]);
  });
}
