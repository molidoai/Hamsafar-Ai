import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { loadJson, saveJson } from "../../storage/src";

export interface Session {
  token: string;
  userId: string;
  deviceId: string;
  expiresAt: number;
}

type User = {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  edition: "personal" | "family" | "pro";
};

const STORE = "data/users.json";
const users = new Map<string, User>(loadJson<User[]>(STORE, []).map((u) => [u.id, u]));
const sessions = new Map<string, Session>();

function persistUsers() {
  saveJson(STORE, [...users.values()]);
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function register(email: string, password: string) {
  if (!email.includes("@") || password.length < 8) throw new Error("INVALID_CREDENTIALS");
  if ([...users.values()].some((u) => u.email === email)) throw new Error("EMAIL_EXISTS");
  const salt = randomBytes(16).toString("hex");
  const user: User = {
    id: `user_${users.size + 1}`,
    email,
    salt,
    passwordHash: hashPassword(password, salt),
    edition: "personal",
  };
  users.set(user.id, user);
  persistUsers();
  return { id: user.id, email: user.email, edition: user.edition };
}

export function login(email: string, password: string, deviceId = "device_local") {
  const user = [...users.values()].find((u) => u.email === email);
  if (!user || !hashesMatch(user.passwordHash, hashPassword(password, user.salt))) {
    throw new Error("LOGIN_FAILED");
  }
  const token = `tok_${createHash("sha256").update(randomBytes(24)).digest("hex").slice(0, 32)}`;
  const session: Session = {
    token,
    userId: user.id,
    deviceId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12,
  };
  sessions.set(token, session);
  return session;
}

export function requireSession(token?: string): Session {
  if (!token) throw new Error("UNAUTHENTICATED");
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) throw new Error("UNAUTHENTICATED");
  return session;
}

export function logout(token?: string): void {
  if (token) sessions.delete(token);
}

export function setEdition(userId: string, edition: User["edition"]) {
  const user = users.get(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  user.edition = edition;
  persistUsers();
  return { userId, edition };
}

export function getEditionForUser(userId: string): User["edition"] {
  return users.get(userId)?.edition ?? "personal";
}
