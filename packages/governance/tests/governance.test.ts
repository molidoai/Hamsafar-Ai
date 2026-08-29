import { registerCapability, authorizeCapability } from "../src/capability/registry";
import { estimateAndReserve, selectModel } from "../src/token/economy";
import { decideAutonomy } from "../src/autonomy/governor";
import { checkMemoryAccess } from "../src/memory/firewall";
import { engage, assertAlive } from "../src/killswitch/switches";

registerCapability({
  id: "trip.create",
  name: "Create Trip",
  description: "Create a user trip",
  ownerAgent: "travel_agent",
  requiredPermissions: ["trip.write"],
  dependencies: [],
  riskLevel: "low",
  tokenBudget: 2000,
  allowedTools: ["trip-store"],
  dataAccessScope: ["user_memory", "application_memory"],
  version: "0.1.0",
  featureFlag: true,
  killSwitch: false,
  status: "active",
});

const cap = authorizeCapability("travel_agent", "trip.create", ["trip.write"]);
if (cap.id !== "trip.create") throw new Error("capability auth failed");

const token = estimateAndReserve("travel_agent", 800);
if (!token.allowed) throw new Error("token reserve failed");
if (selectModel("low") !== "fast-cheap") throw new Error("model routing failed");

const auto = decideAutonomy({
  agentId: "travel_agent",
  action: "create_trip",
  capabilityId: "trip.create",
  riskLevel: "low",
  requestedLevel: 2,
});
if (auto.decision !== "AUTO") throw new Error("autonomy failed");

const memory = checkMemoryAccess({
  agentId: "travel_agent",
  zone: "security_data",
  purpose: "test",
});
if (memory.decision !== "deny") throw new Error("memory firewall failed");

engage("global");
let killed = false;
try {
  assertAlive("travel_agent", "trip.create");
} catch {
  killed = true;
}
if (!killed) throw new Error("kill switch failed");

console.log("GOVERNED_CORE_TESTS_PASS");
