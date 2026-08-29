import type { AutonomyDecision, AutonomyRequest } from "../types";

const LEVELS = {
  0: "OBSERVE",
  1: "RECOMMEND",
  2: "LOW_RISK_AUTO",
  3: "SUPERVISED_AUTO",
  4: "HUMAN_APPROVAL",
  5: "BLOCKED",
} as const;

export function decideAutonomy(request: AutonomyRequest): {
  decision: AutonomyDecision;
  levelName: string;
  reason: string;
} {
  if (request.riskLevel === "critical" || request.requestedLevel >= 5) {
    return { decision: "BLOCK", levelName: LEVELS[5], reason: "critical or blocked action" };
  }
  if (request.riskLevel === "high" || request.requestedLevel >= 4) {
    return { decision: "REVIEW", levelName: LEVELS[4], reason: "human approval required" };
  }
  if (request.requestedLevel <= 2 && request.riskLevel === "low") {
    return { decision: "AUTO", levelName: LEVELS[request.requestedLevel], reason: "low-risk approved path" };
  }
  if (request.requestedLevel === 3) {
    return { decision: "REVIEW", levelName: LEVELS[3], reason: "supervised automation needs review" };
  }
  return { decision: "REVIEW", levelName: LEVELS[1], reason: "default to recommendation only" };
}
