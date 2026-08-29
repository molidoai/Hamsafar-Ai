import { registerCapability } from "./registry";

const items = [
  ["trip.create", "Create Trip", "travel_agent", "low", ["trip.write"]],
  ["nav.route", "Plan Route", "navigation_agent", "low", ["nav.read"]],
  ["safety.speed_alert", "Speed Alert", "safety_agent", "medium", ["safety.read"]],
  ["emergency.sos", "Trigger SOS", "safety_agent", "high", ["emergency.trigger"]],
  ["offline.sync", "Sync Queue", "travel_agent", "low", ["sync.write"]],
] as const;

export function seedProductCapabilities(): void {
  for (const [id, name, owner, risk, perms] of items) {
    try {
      registerCapability({
        id,
        name,
        description: name,
        ownerAgent: owner,
        requiredPermissions: [...perms],
        dependencies: [],
        riskLevel: risk,
        tokenBudget: 1500,
        allowedTools: [id],
        dataAccessScope:
          id === "emergency.sos"
            ? ["user_memory", "sensitive_data"]
            : ["application_memory", "user_memory"],
        version: "0.1.0",
        featureFlag: true,
        killSwitch: false,
        status: "active",
      });
    } catch {
      // already registered
    }
  }
}
