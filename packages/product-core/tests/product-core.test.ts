import { createTrip, listUserTrips } from "../src/travel/engine";
import { planRoute } from "../src/navigation/routing";
import { evaluateSpeed } from "../src/safety/road";
import { addTrustedContact, triggerSos } from "../src/emergency/sos";
import { enqueue, processQueue, pendingCount } from "../src/offline/sync";
import { addMember, canShareLocation, createGroup } from "../src/groups/family";
import { enabledFeatures, resolveMode } from "../src/degrade/modes";
import { listNotices, pushNotice } from "../src/notify/local";

const trip = createTrip("user_1", "تهران تا اصفهان", [
  { name: "تهران", lat: 35.7, lng: 51.4 },
  { name: "اصفهان", lat: 32.6, lng: 51.7 },
]);
if (listUserTrips("user_1").length !== 1) throw new Error("trip list failed");
if (trip.stops.length !== 2) throw new Error("multi-stop failed");

const route = planRoute(trip.stops[0], trip.stops[1], true);
if (!route.fallback || route.confidence !== "low") throw new Error("offline route fallback failed");

const alert = evaluateSpeed({
  currentSpeedKmh: 140,
  speedLimitKmh: 100,
  limitConfidence: "high",
  weatherRisk: "none",
});
if (alert.level !== "CRITICAL") throw new Error("speed alert failed");

const uncertain = evaluateSpeed({
  currentSpeedKmh: 80,
  limitConfidence: "unknown",
  weatherRisk: "none",
});
if (uncertain.claimCertainty) throw new Error("uncertain limit must not claim certainty");

addTrustedContact("user_1", { id: "c1", name: "خانواده", phone: "+98000" });
const sos = triggerSos("user_1", { lat: 35.7, lng: 51.4 }, true);
if (!sos.offline || sos.notifiedContactIds.length !== 1) throw new Error("sos failed");

enqueue("trip", trip);
if (pendingCount() !== 1) throw new Error("queue failed");
processQueue(true);
if (pendingCount() !== 0) throw new Error("sync failed");

const group = createGroup("user_1", "خانواده");
addMember(group.id, "user_1", "user_2", "adult");
if (canShareLocation(group, "user_2", false)) throw new Error("location requires consent");
if (!canShareLocation(group, "user_2", true)) throw new Error("consent share failed");

const offlineMode = resolveMode({
  aiAvailable: false,
  networkAvailable: false,
  externalApisAvailable: false,
  storageAvailable: true,
});
if (offlineMode !== "OFFLINE_MODE") throw new Error("offline mode failed");
if (enabledFeatures(offlineMode).includes("ai.assist")) throw new Error("ai must drop first");
if (!enabledFeatures("CORE_SAFETY_MODE").includes("emergency.sos")) throw new Error("sos must remain");
pushNotice("system", "حالت آفلاین", "شبکه قطع است");
if (!listNotices().length) throw new Error("notice failed");

console.log("USABLE_PRODUCT_CORE_TESTS_PASS");
