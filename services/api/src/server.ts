import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { register, login, logout, requireSession, setEdition, getEditionForUser } from "../../../packages/identity/src";
import { createTrip, listUserTrips } from "../../../packages/product-core/src/travel/engine";
import { evaluateSpeed } from "../../../packages/product-core/src/safety/road";
import { addTrustedContact, triggerSos } from "../../../packages/product-core/src/emergency/sos";
import { presentPlace, searchPlaces } from "../../../packages/destinations/src";
import { canUse, editions, getEdition } from "../../../packages/editions/src";
import { cancelOrder, createOrder, invoice, listOrders, quote, seasonOf, seasons, summary } from "../../../packages/billing/src";
import { suggestItinerary } from "../../../packages/product-core/src/ai/assist";
import { enabledFeatures, resolveMode } from "../../../packages/product-core/src/degrade/modes";
import { checkUpdate, verifyManifestSignature, UpdateManifest } from "../../../packages/updates/src";
import { existsSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

function loadManifest(): UpdateManifest {
  const paths = [join(process.cwd(), "infrastructure/updates/manifest.json"), join(process.cwd(), "../../infrastructure/updates/manifest.json")];
  const file = paths.find((p) => existsSync(p));
  if (!file) throw new Error("UPDATE_MANIFEST_MISSING");
  return JSON.parse(readFileSync(file, "utf8"));
}

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
  });
}

function send(res: ServerResponse, code: number, data: unknown) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type, authorization, x-lang" });
  res.end(JSON.stringify(data));
}

function token(req: IncomingMessage) {
  return req.headers.authorization?.replace("Bearer ", "");
}

function serveWeb(pathname: string, res: ServerResponse): boolean {
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  const roots = [join(process.cwd(), `apps/${admin ? "admin" : "web"}`), join(process.cwd(), `../../apps/${admin ? "admin" : "web"}`)];
  const root = roots.find((p) => existsSync(join(p, "index.html")));
  if (!root) return false;
  let rel = pathname === "/" || pathname === "/admin" || pathname === "/admin/" ? "/index.html" : pathname.replace(/^\/admin/, "");
  if (!rel || rel === "/") rel = "/index.html";
  if (rel.includes("..")) return false;
  const file = join(root, rel);
  if (!existsSync(file)) return false;
  const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
  res.writeHead(200, { "content-type": types[extname(file)] || "text/plain; charset=utf-8", "access-control-allow-origin": "*" });
  res.end(readFileSync(file));
  return true;
}

export function createApp() {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (req.method === "OPTIONS") return send(res, 204, {});
    if (req.method === "GET" && serveWeb(url.pathname, res)) return;
    try {
      if (req.method === "GET" && url.pathname === "/health") {
        return send(res, 200, { ok: true, env: "local", version: "0.3.0", apps: { web: "/", admin: "/admin" }, mode: resolveMode({ aiAvailable: true, networkAvailable: true, externalApisAvailable: true, storageAvailable: true }), features: enabledFeatures("full" as any) });
      }
      if (req.method === "GET" && url.pathname === "/meta") return send(res, 200, { name: "MOLIDO HAMSAFAR", version: "0.3.0", localComplete: true, cloudReady: false });
      if (req.method === "GET" && url.pathname === "/editions") return send(res, 200, editions);
      if (req.method === "GET" && url.pathname === "/billing/seasons") return send(res, 200, { current: seasonOf(), seasons });
      if (req.method === "GET" && url.pathname === "/billing/quote") return send(res, 200, quote((url.searchParams.get("edition") as any) || "family", (url.searchParams.get("currency") as any) || "IRR", (url.searchParams.get("cycle") as any) || "monthly"));
      if (req.method === "GET" && url.pathname === "/destinations") return send(res, 200, searchPlaces(url.searchParams.get("q") || "").map(presentPlace));
      if (req.method === "GET" && url.pathname === "/update/check") {
        const manifest = loadManifest();
        if (!verifyManifestSignature(manifest)) return send(res, 400, { error: "INVALID_UPDATE_SIGNATURE" });
        return send(res, 200, { ...checkUpdate(url.searchParams.get("current") || "0.3.0", manifest), platform: url.searchParams.get("platform") || "web" });
      }
      if (req.method === "POST" && url.pathname === "/auth/register") {
        const body = await readBody(req);
        return send(res, 201, register(body.email, body.password));
      }
      if (req.method === "POST" && url.pathname === "/auth/login") {
        const body = await readBody(req);
        return send(res, 200, login(body.email, body.password));
      }
      if (req.method === "POST" && url.pathname === "/auth/logout") {
        logout(token(req));
        return send(res, 200, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/safety/speed") {
        const body = await readBody(req);
        return send(res, 200, evaluateSpeed(body));
      }
      const session = requireSession(token(req));
      if (req.method === "GET" && url.pathname === "/auth/me") {
        const edition = getEditionForUser(session.userId);
        return send(res, 200, { userId: session.userId, edition, pack: getEdition(edition) });
      }
      if (req.method === "POST" && url.pathname === "/editions/select") {
        const body = await readBody(req);
        return send(res, 200, setEdition(session.userId, body.edition));
      }
      if (req.method === "POST" && url.pathname === "/billing/orders") {
        const body = await readBody(req);
        const order = createOrder(session.userId, body.edition, body.currency || "IRR", body.cycle || "monthly");
        if (order.status === "free") setEdition(session.userId, "personal");
        return send(res, 201, order);
      }
      if (req.method === "GET" && url.pathname === "/billing/orders") return send(res, 200, listOrders(session.userId));
      if (req.method === "GET" && url.pathname === "/billing/summary") return send(res, 200, summary(session.userId));
      if (req.method === "GET" && url.pathname.startsWith("/billing/invoice/")) return send(res, 200, invoice(session.userId, url.pathname.split("/").pop() || ""));
      if (req.method === "POST" && url.pathname.startsWith("/billing/cancel/")) return send(res, 200, cancelOrder(session.userId, url.pathname.split("/").pop() || ""));
      if (req.method === "POST" && url.pathname === "/trips") {
        const body = await readBody(req);
        return send(res, 201, createTrip(session.userId, body.title, body.stops || []));
      }
      if (req.method === "GET" && url.pathname === "/trips") return send(res, 200, listUserTrips(session.userId));
      if (req.method === "POST" && url.pathname === "/emergency/contacts") {
        if (!canUse(getEditionForUser(session.userId), "sos")) return send(res, 403, { error: "EDITION_REQUIRED", need: "family" });
        const body = await readBody(req);
        addTrustedContact(session.userId, body);
        return send(res, 201, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/emergency/sos") {
        if (!canUse(getEditionForUser(session.userId), "sos")) return send(res, 403, { error: "EDITION_REQUIRED", need: "family" });
        const body = await readBody(req);
        return send(res, 201, { event: triggerSos(session.userId, body.coords, Boolean(body.offline)) });
      }
      if (req.method === "POST" && url.pathname === "/ai/suggest") {
        if (!canUse(getEditionForUser(session.userId), "advancedAi")) return send(res, 403, { error: "EDITION_REQUIRED", need: "pro" });
        const body = await readBody(req);
        return send(res, 200, suggestItinerary(body.query || ""));
      }
      return send(res, 404, { error: "NOT_FOUND" });
    } catch (e: any) {
      const code = ["UNAUTHENTICATED", "LOGIN_FAILED"].includes(e.message) ? 401 : 400;
      return send(res, code, { error: e.message });
    }
  };
}

if (process.argv[1]?.includes("server.ts")) {
  const port = Number(process.env.PORT || 8080);
  createServer(createApp()).listen(port, () => console.log(`HAMSAFAR_API_LOCAL http://127.0.0.1:${port}`));
}
