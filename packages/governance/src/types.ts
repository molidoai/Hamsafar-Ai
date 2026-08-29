export type RiskLevel = "low" | "medium" | "high" | "critical";
export type CapabilityStatus = "active" | "disabled" | "killed";
export type MemoryZone =
  | "public_knowledge"
  | "destination_knowledge"
  | "application_memory"
  | "user_memory"
  | "private_user_data"
  | "sensitive_data"
  | "security_data";
export type MemoryDecision = "allow" | "redact" | "deny";
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type AutonomyDecision = "AUTO" | "REVIEW" | "BLOCK";

export interface Capability {
  id: string;
  name: string;
  description: string;
  ownerAgent: string;
  requiredPermissions: string[];
  dependencies: string[];
  riskLevel: RiskLevel;
  tokenBudget: number;
  allowedTools: string[];
  dataAccessScope: MemoryZone[];
  version: string;
  featureFlag: boolean;
  killSwitch: boolean;
  status: CapabilityStatus;
}

export interface TokenBudget {
  perRequest: number;
  perSession: number;
  perHour: number;
  perDay: number;
  emergency: number;
}

export interface TokenUsage {
  agentId: string;
  request: number;
  session: number;
  hour: number;
  day: number;
}

export interface AutonomyRequest {
  agentId: string;
  action: string;
  capabilityId: string;
  riskLevel: RiskLevel;
  requestedLevel: AutonomyLevel;
}

export interface MemoryRequest {
  agentId: string;
  zone: MemoryZone;
  purpose: string;
}
