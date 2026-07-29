import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { domainsMatchOrRelated } from "../../utils/domains";

function finding(ruleId: string, severity: SecurityFinding["severity"], scoreContribution: number, title: string, explanation: string, recommendation: string, evidence: Record<string, unknown>): SecurityFinding {
  return { id: ruleId, ruleId, category: "consistency", severity, scoreContribution, confidence: 0.72, title, explanation, evidence, recommendation, targetElementId: typeof evidence.linkId === "string" ? evidence.linkId : undefined };
}

function signatureName(bodyText: string): string | null {
  const match = /(?:regards|sincerely|best|thank you),?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i.exec(bodyText);
  return match?.[1] ?? null;
}

export const consistencyRules: readonly AnalysisRule[] = [
  {
    id: "CONSISTENCY_SIGNATURE_MISMATCH",
    category: "consistency",
    analyze: (message) => {
      const senderName = message.sender?.displayName?.trim();
      const signedName = signatureName(message.bodyText);
      if (!senderName || !signedName) return [];
      const senderTokens = senderName.toLowerCase().split(/\s+/);
      const signatureTokens = signedName.toLowerCase().split(/\s+/);
      const matches = senderTokens.some((token) => signatureTokens.includes(token));
      return matches ? [] : [finding("CONSISTENCY_SIGNATURE_MISMATCH", "medium", 8, "Signature does not match the visible sender name", "The message signature names a person different from the visible sender identity.", "Verify the sender through a trusted contact before responding or acting.", { senderName, signedName })];
    },
  },
  {
    id: "CONSISTENCY_UNRELATED_DOMAINS",
    category: "consistency",
    analyze: (message) => {
      const senderDomain = message.sender?.address?.split("@")[1] ?? null;
      if (!senderDomain) return [];
      const unrelatedLinks = message.links.filter((link) => link.hostname && !domainsMatchOrRelated(senderDomain, link.hostname));
      if (unrelatedLinks.length === 0) return [];
      return [finding("CONSISTENCY_UNRELATED_DOMAINS", "low", 5, "A visible link uses an unrelated domain", "At least one visible link points to a domain unrelated to the sender domain. This can be legitimate for mailing infrastructure, but it deserves verification.", "Check the destination and verify the request through the claimed organization's official website.", { senderDomain, unrelatedDomains: unrelatedLinks.map((link) => link.hostname), linkIds: unrelatedLinks.map((link) => link.id), linkId: unrelatedLinks[0]?.id })];
    },
  },
];

export function runConsistencyRules(message: EmailMessage, _context: AnalysisContext): SecurityFinding[] {
  return consistencyRules.flatMap((rule) => rule.analyze(message, _context));
}

