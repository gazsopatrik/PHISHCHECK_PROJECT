import type { SecurityFinding } from "../models/analysis";
import type { EmailMessage } from "../models/email";

export function applyCorrelationRules(message: EmailMessage, findings: readonly SecurityFinding[]): SecurityFinding[] {
  const hasBrandImpersonation = findings.some((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION");
  const hasLinkMismatch = findings.some((finding) => finding.ruleId === "LINK_TEXT_DESTINATION_MISMATCH");
  if (!hasBrandImpersonation || !hasLinkMismatch) return [];

  const brand = findings.find((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION")?.evidence.brand;
  return [{
    id: "CORRELATION_BRAND_SENDER_LINK",
    ruleId: "CORRELATION_BRAND_SENDER_LINK",
    category: "consistency",
    severity: "high",
    scoreContribution: 12,
    confidence: 0.9,
    title: "Brand identity and link destination are inconsistent",
    explanation: `The message references ${typeof brand === "string" ? brand : "a known brand"}, while both the sender identity and a visible link point elsewhere.`,
    evidence: { brand: typeof brand === "string" ? brand : null, senderAddress: message.sender?.address ?? null, mismatchedLinkCount: findings.filter((finding) => finding.ruleId === "LINK_TEXT_DESTINATION_MISMATCH").length },
    recommendation: "Do not use the message links. Verify the request through the brand's official website or a trusted contact.",
  }];
}