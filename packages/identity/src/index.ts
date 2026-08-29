export interface Session {
  token: string;
  userId: string;
  deviceId: string;
  expiresAt: number;
}

const users = new Map<string, { id: string; email: string; password: string }>();
const sessions = new Map<string, Session>();

export function register(email: string, password: string) {
  if (!email.includes("@") || password.length < 8) throw new Error("INVALID_CREDENTIALS");
  if ([...users.values()].some((u) => u.email === email)) throw new Error("EMAIL_EXISTS");
  const user = { id: `user_${users.size + 1}`, email, password };
  users.set(user.id, user);
  return { id: user.id, email: user.email };
}

export function login(email: string, password: string, deviceId = "device_local") {
  const user = [...users.values()].find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("LOGIN_FAILED");
  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
