export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RoutePlan {
  distanceKm: number;
  etaMinutes: number;
  confidence: "high" | "medium" | "low";
  fallback: boolean;
  points: RoutePoint[];
}

export function planRoute(from: RoutePoint, to: RoutePoint, offline = false): RoutePlan {
  const dy = to.lat - from.lat;
  const dx = to.lng - from.lng;
  const distanceKm = Math.max(0.1, Math.sqrt(dy * dy + dx * dx) * 111);
  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    etaMinutes: Math.max(1, Math.round((distanceKm / 40) * 60)),
    confidence: offline ? "low" : "medium",
    fallback: offline,
    points: [from, to],
  };
}
