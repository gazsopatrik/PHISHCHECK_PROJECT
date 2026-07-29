import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";
import { isPunycodeHostname, levenshteinDistance, normalizeHostname } from "../../utils/domains";

const FREE_EMAIL_PROVIDERS = new Set(["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "proton.me", "protonmail.com"]);

function senderFinding(ruleId: string, severity: SecurityFinding["severity"], scoreContribution: number, title: string, explanation: string, recommendation: string, evidence: Record<string, unknown>): SecurityFinding {
  return { id: ruleId, ruleId, category: "sender", severity, scoreContribution, confidence: 0.9, title, explanation, recommendation, evidence };
}

export const senderRules: readonly AnalysisRule[] = [
  {
    id: "SENDER_PUNYCODE_DOMAIN",
    category: "sender",
    analyze: (message) => {
      const address = message.sender?.address;
      const hostname = address?.split("@")[1] ?? null;
      return hostname && isPunycodeHostname(hostname) ? [senderFinding("SENDER_PUNYCODE_DOMAIN", "high", 15, "Sender uses an encoded domain", "The sender domain contains punycode, which can be used to make lookalike domains harder to recognize.", "Verify the sender through an independent trusted channel.", { hostname })] : [];
    },
  },
  {
    id: "SENDER_BRAND_IMPERSONATION",
    category: "sender",
    analyze: (message, context) => {
      const sender = message.sender;
      const address = sender?.address;
      const hostname = address?.split("@")[1] ?? null;
      if (!sender || !hostname) return [];
      const display = sender.displayName?.toLowerCase() ?? "";
      const brand = context.brands.find((candidate) => candidate.keywords.some((keyword) => display.includes(keyword)));
      if (!brand) return [];
      const normalized = normalizeHostname(hostname);
      const legitimate = brand.domains.some((domain) => normalized === domain || normalized?.endsWith(`.${domain}`));
      if (legitimate) return [];
      const closeTypo = brand.domains.some((domain) => levenshteinDistance(normalized ?? "", domain) <= 2);
      return [senderFinding("SENDER_BRAND_IMPERSONATION", closeTypo ? "high" : "medium", closeTypo ? 20 : 12, "Sender may impersonate a known brand", `The sender name references ${brand.name}, but the sender domain is ${hostname}.`, "Verify the request using the brand's official website or a trusted contact method.", { brand: brand.name, senderDomain: hostname, closeTypo })];
    },
  },
  {
    id: "SENDER_FREE_PROVIDER_COMPANY_IDENTITY",
    category: "sender",
    analyze: (message) => {
      const sender = message.sender;
      const address = sender?.address;
      const hostname = address?.split("@")[1]?.toLowerCase() ?? null;
      const display = sender?.displayName?.toLowerCase() ?? "";
      const authorityTerm = /support|security|billing|admin|bank|payroll|verification/.test(display);
      return hostname && FREE_EMAIL_PROVIDERS.has(hostname) && authorityTerm ? [senderFinding("SENDER_FREE_PROVIDER_COMPANY_IDENTITY", "medium", 8, "Company-style sender uses a free email provider", "The sender presents an authority or support identity from a free mailbox provider.", "Confirm the sender address through an existing trusted contact or official website.", { hostname, displayName: sender?.displayName })] : [];
    },
  },
];

export function runSenderRules(message: EmailMessage, context: AnalysisContext): SecurityFinding[] {
  return senderRules.flatMap((rule) => rule.analyze(message, context));
}