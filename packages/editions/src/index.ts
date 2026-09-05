export type EditionId = "personal" | "family" | "pro";

export interface Edition {
  id: EditionId;
  nameFa: string;
  tagline: string;
  priceMonthlyUsd: number;
  priceMonthlyIrr: number;
  currencies: Array<"USD" | "IRR">;
  features: string[];
  limits: {
    trips: number;
    members: number;
    offline: boolean;
    sos: boolean;
    speedAlerts: boolean;
    groups: boolean;
    advancedAi: boolean;
  };
}

export const editions: Edition[] = [
  {
    id: "personal",
    nameFa: "همسفر پایه",
    tagline: "سفر انفرادی، سبک و آفلاین",
    priceMonthlyUsd: 0,
    priceMonthlyIrr: 0,
    currencies: ["USD", "IRR"],
    features: ["ساخت سفر", "جستجوی مقصد", "هشدار سرعت", "حالت آفلاین"],
    limits: { trips: 10, members: 1, offline: true, sos: false, speedAlerts: true, groups: false, advancedAi: false },
  },
  {
    id: "family",
    nameFa: "همسفر خانواده",
    tagline: "گروه خانوادگی و SOS",
    priceMonthlyUsd: 6,
    priceMonthlyIrr: 2900000,
    currencies: ["USD", "IRR"],
    features: ["همه امکانات پایه", "سفر گروهی", "مخاطب مطمئن", "SOS", "اشتراک موقعیت با رضایت"],
    limits: { trips: 50, members: 8, offline: true, sos: true, speedAlerts: true, groups: true, advancedAi: false },
  },
  {
    id: "pro",
    nameFa: "همسفر حرفه‌ای",
    tagline: "برای راهنما، ناوگان و تیم سفر",
    priceMonthlyUsd: 19,
    priceMonthlyIrr: 9900000,
    currencies: ["USD", "IRR"],
    features: ["همه امکانات خانواده", "بودجه توکن بیشتر", "اولویت پشتیبانی", "آمادگی اتصال سازمانی"],
    limits: { trips: 500, members: 40, offline: true, sos: true, speedAlerts: true, groups: true, advancedAi: true },
  },
];

export function getEdition(id: EditionId): Edition {
  const found = editions.find((e) => e.id === id);
  if (!found) throw new Error("UNKNOWN_EDITION");
  return found;
}

export function canUse(id: EditionId, feature: keyof Edition["limits"]): boolean {
  const value = getEdition(id).limits[feature];
  return typeof value === "boolean" ? value : true;
}

export function formatIrr(amount: number): string {
  return amount.toLocaleString("fa-IR") + " ریال";
}
