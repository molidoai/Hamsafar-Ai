import type { Capability } from "../types";

const capabilities = new Map<string, Capability>();

export function registerCapability(capability: Capability): Capability {
  if (capabilities.has(capability.id)) {
    throw new Error(`Capability already exists: ${capability.id}`);
  }
  capabilities.set(capability.id, { ...capability });
  return capability;
}

export function getCapability(id: string): Capability | undefined {
  return capabilities.get(id);
}

export function authorizeCapability(
  agentId: string,
  capabilityId: string,
  permissions: string[]
): Capability {
  const capability = capabilities.get(capabilityId);
  if (!capability) throw new Error(`Unknown capability: ${capabilityId}`);
  if (capability.status !== "active" || capability.killSwitch) {
    throw new Error(`Capability blocked: ${capabilityId}`);
  }
  if (capability.ownerAgent !== agentId && capability.ownerAgent !== "*") {
    throw new Error(`Agent ${agentId} cannot use ${capabilityId}`);
  }
  const missing = capability.requiredPermissions.filter(
    (p) => !permissions.includes(p)
  );
  if (missing.length) {
    throw new Error(`Missing permissions: ${missing.join(", ")}`);
  }
  return capability;
}

export function listCapabilities(): Capability[] {
  return [...capabilities.values()];
}

export function killCapability(id: string): void {
  const capability = capabilities.get(id);
  if (!capability) throw new Error(`Unknown capability: ${id}`);
  capabilities.set(id, { ...capability, killSwitch: true, status: "killed" });
}
