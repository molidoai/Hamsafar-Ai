import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { register, login, requireSession } from "../../../packages/identity/src";
import { createTrip, listUserTrips } from "../../../packages/product-core/src/travel/engine";
import { planRoute } from "../../../packages/product-core/src/navigation/routing";
import { evaluateSpeed } from "../../../packages/product-core/src/safety/road";
import { addTrustedContact, triggerSos } from "../../../packages/product-core/src/emergency/sos";
import { enqueue, processQueue } from "../../../packages/product-core/src/offline/sync";
import { addMember, createGroup } from "../../../packages/product-core/src/groups/family";
import { t } from "../../../packages/localization/src";
import { decideAutonomy } from "../../../packages/governance/src/autonomy/governor";
import { estimateAndReserve } from "../../../packages/governance/src/token/economy";
import { presentPlace, searchPlaces } from "../../../packages/destinations/src";

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

function send(res: ServerResponse, code: number, data: unknown) {
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization, x-lang",
  });
  res.end(JSON.stringify(data));
}

function token(req: IncomingMessage) {
  return req.headers.authorization?.replace("Bearer ", "");
}

export function createApp() {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", "http://localhost");
    const lang = String(req.headers["x-lang"] || "fa");
    if (req.method === "OPTIONS") return send(res, 204, {});
    try {
      if (req.method === "GET" && url.pathname === "/health") {
        return send(res, 200, { ok: true, env: "local", domain: "hamsafa.molido.shop" });
      }
      if (req.method === "GET" && url.pathname === "/destinations") {
        const q = url.searchParams.get("q") || "";
        return send(res, 200, searchPlaces(q).map(presentPlace));
      }
      if (req.method === "GET" && url.pathname === "/control/status") {
        return send(res, 200, {
          phases: { "000": "PASS", "001": "PASS", "002": "PASS", "003": "PASS", "004": "PASS" },
          server: "local-only",
        });
      }
      if (req.method === "GET" && url.pathname === "/i18n") {
        return send(res, 200, {
          app: t(lang, "app_name"),
          trip: t(lang, "trip_create"),
          sos: t(lang, "sos"),
        });
      }
      if (req.method === "POST" && url.pathname === "/auth/register") {
        const body = await readBody(req);
        return send(res, 201, register(body.email, body.password));
      }
      if (req.method === "POST" && url.pathname === "/auth/login") {
        const body = await readBody(req);
        return send(res, 200, login(body.email, body.password));
      }
      const session = requireSession(token(req));
      if (req.method === "POST" && url.pathname === "/trips") {
        const budget = estimateAndReserve(session.userId, 400);
        if (!budget.allowed) return send(res, 429, { error: budget.reason });
        const body = await readBody(req);
        const trip = createTrip(session.userId, body.title, body.stops || []);
        enqueue("trip", trip);
        return send(res, 201, trip);
      }
      if (req.method === "GET" && url.pathname === "/trips") {
        return send(res, 200, listUserTrips(session.userId));
      }
      if (req.method === "POST" && url.pathname === "/nav/route") {
        const body = await readBody(req);
        return send(res, 200, planRoute(body.from, body.to, Boolean(body.offline)));
      }
      if (req.method === "POST" && url.pathname === "/safety/speed") {
        const body = await readBody(req);
        return send(res, 200, evaluateSpeed(body));
      }
      if (req.method === "POST" && url.pathname === "/emergency/contacts") {
        const body = await readBody(req);
        addTrustedContact(session.userId, body);
        return send(res, 201, { ok: true });
      }
      if (req.method === "POST" && url.pathname === "/emergency/sos") {
        const gate = decideAutonomy({
          agentId: "safety_agent",
          action: "sos",
          capabilityId: "emergency.sos",
          riskLevel: "high",
          requestedLevel: 4,
        });
        if (gate.decision === "BLOCK") return send(res, 403, gate);
        const body = await readBody(req);
        const event = triggerSos(session.userId, body.coords, Boolean(body.offline));
        enqueue("sos", event);
        return send(res, 201, { event, autonomy: gate });
      }
      if (req.method === "POST" && url.pathname === "/sync") {
        return send(res, 200, processQueue(true));
      }
      if (req.method === "POST" && url.pathname === "/groups") {
        const body = await readBody(req);
        return send(res, 201, createGroup(session.userId, body.name || "خانواده"));
      }
      if (req.method === "POST" && url.pathname === "/groups/members") {
        const body = await readBody(req);
        return send(res, 200, addMember(body.groupId, session.userId, body.userId, body.role || "member"));
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
  createServer(createApp()).listen(port, () => {
    console.log(`HAMSAFAR_API_LOCAL http://127.0.0.1:${port}`);
  });
}
