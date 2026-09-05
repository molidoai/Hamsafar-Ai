import { EditionId, getEdition } from "../../editions/src";
import { loadJson, saveJson } from "../../storage/src";

export type Currency = "USD" | "IRR";
export type Cycle = "monthly" | "yearly";

export interface Order {
  id: string;
  userId: string;
  edition: EditionId;
  currency: Currency;
  cycle: Cycle;
  amount: number;
  status: "free" | "pending" | "cancelled";
  createdAt: string;
}

const STORE = "data/orders.json";
const orders: Order[] = loadJson<Order[]>(STORE, []);

function persist() {
  saveJson(STORE, orders);
}

export const seasons = [
  { month: 1, id: "winter-low", nameFa: "زمستان کم‌سفر", multiplier: 0.9 },
  { month: 2, id: "winter-ski", nameFa: "زمستان اسکی", multiplier: 1.05 },
  { month: 3, id: "nowruz", nameFa: "نوروز", multiplier: 1.15 },
  { month: 4, id: "nowruz-spring", nameFa: "بهار نوروزی", multiplier: 1.15 },
  { month: 5, id: "spring", nameFa: "بهار", multiplier: 1.05 },
  { month: 6, id: "pre-summer", nameFa: "آغاز تابستان", multiplier: 1 },
  { month: 7, id: "summer", nameFa: "اوج تابستان", multiplier: 1.12 },
  { month: 8, id: "summer-late", nameFa: "اواخر تابستان", multiplier: 1.12 },
  { month: 9, id: "early-autumn", nameFa: "اوایل پاییز", multiplier: 1 },
  { month: 10, id: "autumn", nameFa: "پاییز طبیعت", multiplier: 1.05 },
  { month: 11, id: "low", nameFa: "کم‌سفر پاییزی", multiplier: 0.88 },
  { month: 12, id: "yalda", nameFa: "یلدا و سال نوی میلادی", multiplier: 1.08 },
] as const;

export function seasonOf(now = new Date()) {
  const month = now.getUTCMonth() + 1;
  return seasons.find((s) => s.month === month) || seasons[5];
}

export function seasonMultiplier(now = new Date()): number {
  return seasonOf(now).multiplier;
}

export function quote(edition: EditionId, currency: Currency, cycle: Cycle, opts: { now?: Date; intro?: boolean } = {}) {
  const pack = getEdition(edition);
  const list = currency === "USD" ? pack.priceMonthlyUsd : pack.priceMonthlyIrr;
  if (list === 0) {
    return { edition, currency, cycle, amount: 0, months: cycle === "yearly" ? 12 : 1, list, season: 1, intro: false };
  }
  const seasonInfo = seasonOf(opts.now);
  const season = seasonInfo.multiplier;
  const intro = opts.intro ? 0.85 : 1;
  const monthsPaid = cycle === "yearly" ? 10 : 1;
  const raw = Math.round(list * monthsPaid * season * intro);
  return { edition, currency, cycle, amount: raw, months: cycle === "yearly" ? 12 : 1, list, season, seasonId: seasonInfo.id, seasonName: seasonInfo.nameFa, intro: Boolean(opts.intro) };
}

export function createOrder(userId: string, edition: EditionId, currency: Currency, cycle: Cycle): Order {
  const q = quote(edition, currency, cycle);
  const order: Order = {
    id: `ord_${Date.now()}_${orders.length}`,
    userId,
    edition,
    currency,
    cycle,
    amount: q.amount,
    status: q.amount === 0 ? "free" : "pending",
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  persist();
  return order;
}

export function listOrders(userId: string): Order[] {
  return orders.filter((o) => o.userId === userId);
}

export function getOrder(userId: string, orderId: string): Order {
  const order = orders.find((o) => o.id === orderId && o.userId === userId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  return order;
}

export function invoice(userId: string, orderId: string) {
  const order = getOrder(userId, orderId);
  const pack = getEdition(order.edition);
  return {
    title: "فاکتور مولیدو همسفر",
    orderId: order.id,
    product: pack.nameFa,
    cycle: order.cycle,
    currency: order.currency,
    amount: order.amount,
    status: order.status,
    note: order.status === "pending" ? "پرداخت انجام نشده. این فاکتور پیش‌فاکتور است." : "نسخه رایگان فعال شد.",
    createdAt: order.createdAt,
  };
}

export function invoiceText(userId: string, orderId: string): string {
  const inv = invoice(userId, orderId);
  return [inv.title, `شماره: ${inv.orderId}`, `محصول: ${inv.product}`, `دوره: ${inv.cycle}`, `مبلغ: ${inv.amount} ${inv.currency}`, `وضعیت: ${inv.status}`, inv.note, inv.createdAt].join("\n");
}

export function cancelOrder(userId: string, orderId: string): Order {
  const order = getOrder(userId, orderId);
  if (order.status !== "pending") throw new Error("ORDER_NOT_CANCELLABLE");
  order.status = "cancelled";
  persist();
  return order;
}

export function summary(userId: string) {
  const rows = listOrders(userId);
  const pending = rows.filter((o) => o.status === "pending");
  return {
    total: rows.length,
    pending: pending.length,
    cancelled: rows.filter((o) => o.status === "cancelled").length,
    free: rows.filter((o) => o.status === "free").length,
    pendingUsd: pending.filter((o) => o.currency === "USD").reduce((s, o) => s + o.amount, 0),
    pendingIrr: pending.filter((o) => o.currency === "IRR").reduce((s, o) => s + o.amount, 0),
  };
}
