import { presentPlace, searchPlaces } from "../src";

const all = searchPlaces("");
if (all.length < 4) throw new Error("catalog too small");

const tehran = searchPlaces("تهران");
if (!tehran.length) throw new Error("fa search failed");

const aging = presentPlace(tehran[0]);
if (aging.freshness === "aging" && aging.isCurrentFact) {
  throw new Error("aging data must not be presented as current fact");
}

console.log("DESTINATION_TESTS_PASS");
