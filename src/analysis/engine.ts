import type { AnalysisContext, AnalysisResult, ConfidenceLevel, RiskLevel, SecurityFinding } from "../models/analysis";
import type { EmailMessage } from "../models/email";
import { applyCorrelationRules } from "./correlation";
import { runAttachmentRules } from "./rules/attachment-rules";
import { runContentRules } from "./rules/content-rules";
import { runConsistencyRules } from "./rules/consistency-rules";
import { runMissingInformationRules } from "./rules/missing-information-rules";
import { runLinkRules } from "./rules/link-rules";
import { runSenderRules } from "./rules/sender-rules";
import { calculateConfidence } from "./scoring/confidence";
import { normalizeRiskScore } from "./scoring/score";

function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "suspicious";
  if (score >= 20) return "caution";
  return "low";
}

function confidenceLevel(score: number): ConfidenceLevel {
  return score >= 80 ? "high" : score >= 50 ? "medium" : "low";
}

function summary(score: number, level: RiskLevel, findingCount: number): string {
  if (findingCount === 0) return "No major phishing indicators were detected, but legitimacy is not guaranteed.";
  const labels: Record<RiskLevel, string> = {
    low: "Low detected risk",
    caution: "Some caution indicators were detected",
    suspicious: "Multiple suspicious indicators were detected",
    high: "Strong phishing or impersonation indicators were detected",
    critical: "Several severe phishing indicators were detected",
  };
  return `${labels[level]} (score ${score}/100). Review the findings before taking action.`;
}

export function analyzeMessage(message: EmailMessage, context: AnalysisContext): AnalysisResult {
  const baseFindings = [
    ...runSenderRules(message, context),
    ...runLinkRules(message, context),
    ...runContentRules(message, context),
    ...runAttachmentRules(message, context),
    ...runConsistencyRules(message, context),
    ...runMissingInformationRules(message, context),
  ];
  const findings: SecurityFinding[] = [...baseFindings, ...applyCorrelationRules(message, baseFindings)];
  const riskScore = normalizeRiskScore(findings);
  const confidence = calculateConfidence(message);
  const limitations = [...new Set(confidence.limitations)];
  return {
    riskScore,
    riskLevel: riskLevel(riskScore),
    confidenceScore: confidence.score,
    confidenceLevel: confidenceLevel(confidence.score),
    summary: summary(riskScore, riskLevel(riskScore), findings.length),
    findings,
    analyzedAt: new Date().toISOString(),
    limitations,
  };
}

