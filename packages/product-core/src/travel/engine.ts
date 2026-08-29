export type TripStatus = "draft" | "active" | "completed" | "cancelled";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  stops: Stop[];
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  offlineDirty: boolean;
}

const trips = new Map<string, Trip>();

export function createTrip(userId: string, title: string, stops: Omit<Stop, "id" | "order">[]): Trip {
  if (!title.trim()) throw new Error("TRIP_TITLE_REQUIRED");
  if (stops.length < 1) throw new Error("TRIP_NEEDS_STOP");
  const now = new Date().toISOString();
  const trip: Trip = {
    id: `trip_${Date.now()}`,
    userId,
    title: title.trim(),
    stops: stops.map((s, i) => ({ ...s, id: `stop_${i + 1}`, order: i + 1 })),
    status: "draft",
    createdAt: now,
    updatedAt: now,
    offlineDirty: true,
  };
  trips.set(trip.id, trip);
  return trip;
}

export function updateTripStops(tripId: string, stops: Omit<Stop, "id" | "order">[]): Trip {
  const trip = trips.get(tripId);
  if (!trip) throw new Error("TRIP_NOT_FOUND");
  trip.stops = stops.map((s, i) => ({ ...s, id: `stop_${i + 1}`, order: i + 1 }));
  trip.updatedAt = new Date().toISOString();
  trip.offlineDirty = true;
  return trip;
}

export function listUserTrips(userId: string): Trip[] {
  return [...trips.values()].filter((t) => t.userId === userId);
}

export function getTrip(tripId: string): Trip {
  const trip = trips.get(tripId);
  if (!trip) throw new Error("TRIP_NOT_FOUND");
  return trip;
}
