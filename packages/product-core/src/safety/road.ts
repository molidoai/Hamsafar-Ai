export type AlertLevel = "NORMAL" | "ATTENTION" | "WARNING" | "CRITICAL";

export interface SpeedContext {
  currentSpeedKmh: number;
  speedLimitKmh?: number;
  limitConfidence: "high" | "medium" | "low" | "unknown";
  weatherRisk: "none" | "rain" | "ice" | "fog";
}

export function evaluateSpeed(ctx: SpeedContext): {
  level: AlertLevel;
  message: string;
  claimCertainty: boolean;
} {
  if (!ctx.speedLimitKmh || ctx.limitConfidence === "unknown") {
    return {
      level: "ATTENTION",
      message: "محدودیت سرعت نامشخص است؛ با احتیاط برانید.",
      claimCertainty: false,
    };
  }
  const over = ctx.currentSpeedKmh - ctx.speedLimitKmh;
  if (over >= 30 || ctx.weatherRisk === "ice") {
    return { level: "CRITICAL", message: "خطر بالا؛ سرعت را فوری کم کنید.", claimCertainty: ctx.limitConfidence === "high" };
  }
  if (over >= 15 || ctx.weatherRisk === "fog") {
    return { level: "WARNING", message: "سرعت بالاتر از محدوده ایمن است.", claimCertainty: ctx.limitConfidence !== "low" };
  }
  if (over >= 5 || ctx.weatherRisk === "rain") {
    return { level: "ATTENTION", message: "به سرعت و شرایط جاده توجه کنید.", claimCertainty: false };
  }
  return { level: "NORMAL", message: "وضعیت سرعت عادی است.", claimCertainty: ctx.limitConfidence === "high" };
}
