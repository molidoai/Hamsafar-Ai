type SwitchScope = "global" | "agent" | "capability" | "feature";

const switches = new Map<string, boolean>();

function key(scope: SwitchScope, id = "*"): string {
  return `${scope}:${id}`;
}

export function engage(scope: SwitchScope, id = "*"): void {
  switches.set(key(scope, id), true);
}

export function release(scope: SwitchScope, id = "*"): void {
  switches.set(key(scope, id), false);
}

export function isKilled(scope: SwitchScope, id = "*"): boolean {
  return Boolean(switches.get(key("global", "*")) || switches.get(key(scope, id)));
}

export function assertAlive(agentId: string, capabilityId: string): void {
  if (isKilled("global")) throw new Error("GLOBAL_KILL_SWITCH");
  if (isKilled("agent", agentId)) throw new Error("AGENT_KILL_SWITCH");
  if (isKilled("capability", capabilityId)) throw new Error("CAPABILITY_KILL_SWITCH");
}
