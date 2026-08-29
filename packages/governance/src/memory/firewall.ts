import type { MemoryDecision, MemoryRequest, MemoryZone } from "../types";

const AGENT_ZONES: Record<string, MemoryZone[]> = {
  travel_agent: ["public_knowledge", "destination_knowledge", "application_memory", "user_memory"],
  safety_agent: ["public_knowledge", "application_memory", "user_memory"],
  security_agent: ["security_data", "application_memory"],
};

export function checkMemoryAccess(request: MemoryRequest): {
  decision: MemoryDecision;
  reason: string;
} {
  if (request.zone === "security_data" && request.agentId !== "security_agent") {
    return { decision: "deny", reason: "security data isolated" };
  }
  if (request.zone === "sensitive_data" || request.zone === "private_user_data") {
    return { decision: "deny", reason: "explicit authorization required" };
  }
  const allowed = AGENT_ZONES[request.agentId] ?? ["public_knowledge"];
  if (!allowed.includes(request.zone)) {
    return { decision: "redact", reason: "zone outside agent scope" };
  }
  return { decision: "allow", reason: "minimum required scope granted" };
}
