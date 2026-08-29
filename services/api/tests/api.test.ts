import { createServer } from "node:http";
import { createApp } from "../src/server";

async function req(port: number, method: string, path: string, body?: unknown, token?: string) {
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json() };
}

async function main() {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  const health = await req(port, "GET", "/health?offline=1");
  if (health.status !== 200 || health.json.mode !== "OFFLINE_MODE") throw new Error("health failed");
  const dest = await req(port, "GET", "/destinations?q=اصفهان");
  if (dest.status !== 200 || !dest.json.length) throw new Error("destinations failed");
  const upd = await req(port, "GET", "/update/check?platform=web&current=0.1.0");
  if (upd.status !== 200 || upd.json.updateAvailable !== false) throw new Error("update check failed");

  const reg = await req(port, "POST", "/auth/register", {
    email: "a@molido.shop",
    password: "secret123",
  });
  if (reg.status !== 201) throw new Error("register failed");

  const login = await req(port, "POST", "/auth/login", {
    email: "a@molido.shop",
    password: "secret123",
  });
  if (!login.json.token) throw new Error("login failed");
  const token = login.json.token;

  const trip = await req(
    port,
    "POST",
    "/trips",
    {
      title: "سفر آزمایشی",
      stops: [
        { name: "تهران", lat: 35.7, lng: 51.4 },
        { name: "شیراز", lat: 29.6, lng: 52.5 },
      ],
    },
    token
  );
  if (trip.status !== 201) throw new Error("trip failed");

  await req(port, "POST", "/emergency/contacts", { id: "c1", name: "خانه", phone: "110" }, token);
  const sos = await req(
    port,
    "POST",
    "/emergency/sos",
    { coords: { lat: 35.7, lng: 51.4 }, offline: true },
    token
  );
  if (sos.status !== 201) throw new Error("sos failed");

  server.close();
  console.log("LOCAL_API_TESTS_PASS");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
