export type SystemMode =
  | "FULL_SYSTEM"
  | "REDUCED_AI"
  | "CACHED_INTELLIGENCE"
  | "OFFLINE_MODE"
  | "CORE_SAFETY_MODE";

export interface HealthSignals {
  aiAvailable: boolean;
  networkAvailable: boolean;
  externalApisAvailable: boolean;
  storageAvailable: boolean;
}

export function resolveMode(signals: HealthSignals): SystemMode {
  if (!signals.storageAvailable) return "CORE_SAFETY_MODE";
  if (!signals.networkAvailable) return "OFFLINE_MODE";
  if (!signals.externalApisAvailable) return "CACHED_INTELLIGENCE";
  if (!signals.aiAvailable) return "REDUCED_AI";
  return "FULL_SYSTEM";
}

export function enabledFeatures(mode: SystemMode): string[] {
  const safety = ["emergency.sos", "safety.speed_alert", "nav.route"];
  if (mode === "CORE_SAFETY_MODE") return safety;
  if (mode === "OFFLINE_MODE") return [...safety, "trip.create", "offline.sync"];
  if (mode === "CACHED_INTELLIGENCE") return [...safety, "trip.create", "destinations.cached"];
  if (mode === "REDUCED_AI") return [...safety, "trip.create", "destinations.search", "groups"];
  return [...safety, "trip.create", "destinations.search", "groups", "ai.assist"];
}
