import type { SecurityFinding } from "../models/analysis";
import type { EmailMessage } from "../models/email";

export function applyCorrelationRules(message: EmailMessage, findings: readonly SecurityFinding[]): SecurityFinding[] {
  const manipulativeContentRuleIds = new Set([
    "CONTENT_ADULT_SCAM_LURE",
    "CONTENT_OBFUSCATED_WORDING",
    "CONTENT_UNVERIFIABLE_PROMISE",
  ]);
  const manipulativeContentFindings = findings.filter((finding) => manipulativeContentRuleIds.has(finding.ruleId));
  const correlations: SecurityFinding[] = [];

  if (manipulativeContentFindings.length >= 2) {
    correlations.push({
      id: "CORRELATION_MANIPULATIVE_SPAM_CONTENT",
      ruleId: "CORRELATION_MANIPULATIVE_SPAM_CONTENT",
      category: "consistency",
      severity: "high",
      scoreContribution: 15,
      confidence: 0.86,
      title: "Multiple manipulative spam tactics appear together",
      explanation: "The message combines adult-content bait, disguised wording, or unverifiable claims. Together these are strong signs of deceptive bulk marketing.",
      evidence: { ruleIds: manipulativeContentFindings.map((finding) => finding.ruleId) },
      recommendation: "Do not use the message links. Delete or report the email as spam unless the sender and offer can be independently verified.",
      targetElementId: "gmail-message-body",
    });
  }

  const hasBrandImpersonation = findings.some((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION");
  const hasLinkMismatch = findings.some((finding) => finding.ruleId === "LINK_TEXT_DESTINATION_MISMATCH");
  if (!hasBrandImpersonation || !hasLinkMismatch) return correlations;

  const brand = findings.find((finding) => finding.ruleId === "SENDER_BRAND_IMPERSONATION")?.evidence.brand;
  correlations.push({
    id: "CORRELATION_BRAND_SENDER_LINK",
    ruleId: "CORRELATION_BRAND_SENDER_LINK",
    category: "consistency",
    severity: "high",
    scoreContribution: 12,
    confidence: 0.9,
    title: "Brand identity and link destination are inconsistent",
    explanation: `The message references ${typeof brand === "string" ? brand : "a known brand"}, while both the sender identity and a visible link point elsewhere.`,
    evidence: {
      brand: typeof brand === "string" ? brand : null,
      senderAddress: message.sender?.address ?? null,
      mismatchedLinkCount: findings.filter((finding) => finding.ruleId === "LINK_TEXT_DESTINATION_MISMATCH").length,
    },
    recommendation: "Do not use the message links. Verify the request through the brand's official website or a trusted contact.",
  });
  return correlations;
}

