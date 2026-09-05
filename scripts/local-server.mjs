import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const root = join(process.cwd());
const port = Number(process.env.PORT || 8080);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function send(res, code, body, type = "application/json; charset=utf-8") {
  res.writeHead(code, { "content-type": type, "access-control-allow-origin": "*" });
  res.end(body);
}

function file(rel) {
  const p = join(root, rel);
  return existsSync(p) ? p : null;
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (url.pathname === "/health") {
    return send(res, 200, JSON.stringify({ ok: true, env: "local", version: "0.3.1", server: "plain-node" }));
  }
  if (url.pathname === "/editions") {
    const f = file("packages/editions/data/editions.json") || file("packages/editions/editions.json");
    if (f) return send(res, 200, readFileSync(f));
    return send(res, 200, JSON.stringify([
      { id: "personal", nameFa: "پایه", priceMonthlyUsd: 0, priceMonthlyIrr: 0 },
      { id: "family", nameFa: "خانواده", priceMonthlyUsd: 6, priceMonthlyIrr: 2900000 },
      { id: "pro", nameFa: "حرفه‌ای", priceMonthlyUsd: 19, priceMonthlyIrr: 9900000 }
    ]));
  }
  if (url.pathname === "/destinations") {
    const f = file("packages/destinations/data/catalog.json");
    if (f) {
      const data = JSON.parse(readFileSync(f, "utf8"));
      return send(res, 200, JSON.stringify(data.places || data));
    }
  }
  const admin = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
  let rel = url.pathname === "/" || url.pathname === "/admin" || url.pathname === "/admin/" ? "index.html" : url.pathname.replace(/^\/admin\//, "");
  if (rel.startsWith("/")) rel = rel.slice(1);
  const base = admin ? "apps/admin" : "apps/web";
  const p = file(join(base, rel));
  if (!p) return send(res, 404, JSON.stringify({ error: "NOT_FOUND", path: url.pathname }));
  send(res, 200, readFileSync(p), types[extname(p)] || "text/plain; charset=utf-8");
});

server.listen(port, "127.0.0.1", () => {
  console.log("HAMSAFAR_LOCAL http://127.0.0.1:" + port);
});
