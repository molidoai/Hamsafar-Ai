import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface Place {
  id: string;
  country: string;
  city: string;
  name: string;
  lat: number;
  lng: number;
  freshness: "fresh" | "aging" | "stale";
  confidence: number;
  source: string;
  safety: string;
  tags: string[];
}

const catalogPaths = [
  join(process.cwd(), "packages/destinations/data/catalog.json"),
  join(process.cwd(), "../../packages/destinations/data/catalog.json"),
  join(__dirname, "../data/catalog.json"),
];
const catalogFile = catalogPaths.find((p) => existsSync(p));
if (!catalogFile) throw new Error("DESTINATION_CATALOG_MISSING");
const catalog = JSON.parse(readFileSync(catalogFile, "utf8")) as { places: Place[] };

export function searchPlaces(query: string): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog.places as Place[];
  return (catalog.places as Place[]).filter((p) =>
    [p.name, p.city, p.country, ...p.tags].join(" ").toLowerCase().includes(q)
  );
}

export function getPlace(id: string): Place | undefined {
  return (catalog.places as Place[]).find((p) => p.id === id);
}

export function presentPlace(place: Place) {
  return {
    ...place,
    isCurrentFact: place.freshness === "fresh" && place.confidence >= 0.75,
    warning:
      place.freshness !== "fresh"
        ? "این داده ممکن است به‌روز نباشد"
        : undefined,
  };
}
