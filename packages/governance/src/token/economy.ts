import type { TokenBudget, TokenUsage } from "../types";

const DEFAULT_BUDGET: TokenBudget = {
  perRequest: 4_000,
  perSession: 40_000,
  perHour: 120_000,
  perDay: 500_000,
  emergency: 8_000,
};

const usage = new Map<string, TokenUsage>();

function getUsage(agentId: string): TokenUsage {
  if (!usage.has(agentId)) {
    usage.set(agentId, {
      agentId,
      request: 0,
      session: 0,
      hour: 0,
      day: 0,
    });
  }
  return usage.get(agentId)!;
}

export function estimateAndReserve(
  agentId: string,
  estimatedTokens: number,
  budget: TokenBudget = DEFAULT_BUDGET
): { allowed: boolean; reason?: string; modelTier: "cheap" | "strong" } {
  const current = getUsage(agentId);
  if (estimatedTokens > budget.perRequest) {
    return { allowed: false, reason: "per-request budget exceeded", modelTier: "cheap" };
  }
  if (current.session + estimatedTokens > budget.perSession) {
    return { allowed: false, reason: "session budget exceeded", modelTier: "cheap" };
  }
  if (current.hour + estimatedTokens > budget.perHour) {
    return { allowed: false, reason: "hourly budget exceeded", modelTier: "cheap" };
  }
  if (current.day + estimatedTokens > budget.perDay) {
    return { allowed: false, reason: "daily budget exceeded", modelTier: "cheap" };
  }
  current.request = estimatedTokens;
  current.session += estimatedTokens;
  current.hour += estimatedTokens;
  current.day += estimatedTokens;
  return {
    allowed: true,
    modelTier: estimatedTokens > 1_500 ? "strong" : "cheap",
  };
}

export function selectModel(taskComplexity: "low" | "medium" | "high"): string {
  if (taskComplexity === "low") return "fast-cheap";
  if (taskComplexity === "medium") return "balanced";
  return "strong-reasoner";
}

export function getTokenUsage(agentId: string): TokenUsage {
  return { ...getUsage(agentId) };
}
