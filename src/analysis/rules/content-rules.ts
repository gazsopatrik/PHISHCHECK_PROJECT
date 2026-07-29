import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";

interface ContentPattern {
  id: string;
  pattern: RegExp;
  severity: SecurityFinding["severity"];
  scoreContribution: number;
  title: string;
  explanation: string;
  recommendation: string;
}

const contentPatterns: readonly ContentPattern[] = [
  { id: "CONTENT_URGENCY", pattern: /\b(immediate action|required immediately|act now|urgent|within \d+ hours|account will be suspended)\b/i, severity: "low", scoreContribution: 5, title: "Urgent language is present", explanation: "The message uses time pressure or a threat of account consequences to encourage immediate action.", recommendation: "Pause and verify the request through a trusted channel before acting." },
  { id: "CONTENT_CREDENTIAL_REQUEST", pattern: /\b(verify|confirm|reset|update).{0,80}\b(password|login|credential|account|sign[- ]?in)\b|\b(send|provide|enter|share|give).{0,80}\b(password|login|credential|authentication code|one[- ]?time code)\b|\b(password|login|credential|authentication code|one[- ]?time code).{0,80}\b(send|provide|enter|share|give)\b/i, severity: "high", scoreContribution: 15, title: "The message requests account credentials", explanation: "The content appears to ask the recipient to verify, provide, reset, or enter credentials or authentication data.", recommendation: "Do not provide credentials or codes through the message. Open the official service manually." },
  { id: "CONTENT_FINANCIAL_REQUEST", pattern: /\b(wire|transfer|payment|invoice|bank account|billing|refund|purchase|send money|pay)\b.{0,100}\b(urgent|today|immediately|now|confirm|send|account)\b/i, severity: "high", scoreContribution: 12, title: "The message contains a financial request", explanation: "The message combines financial terms with a request for action or confirmation.", recommendation: "Verify payment instructions using a known contact or an independently opened service." },
  { id: "CONTENT_GIFT_CARD_REQUEST", pattern: /\b(gift cards?|itunes cards?|apple cards?|google play cards?|voucher codes?)\b/i, severity: "high", scoreContribution: 15, title: "The message mentions gift cards or voucher codes", explanation: "Gift-card purchases and voucher-code requests are common social-engineering patterns.", recommendation: "Do not purchase or send codes based on an email request. Confirm the request in person or by phone." },
  { id: "CONTENT_REMOTE_ACCESS_REQUEST", pattern: /\b(anydesk|teamviewer|remote desktop|remote access|screen sharing|install software|enable macros?)\b/i, severity: "high", scoreContribution: 15, title: "The message requests remote access or risky software action", explanation: "The content asks for remote access, screen sharing, software installation, or macro execution.", recommendation: "Do not install software or enable macros from the message. Contact your organization through a trusted channel." },
];

function createFinding(pattern: ContentPattern, evidence: Record<string, unknown>): SecurityFinding {
  return { id: pattern.id, ruleId: pattern.id, category: "content", severity: pattern.severity, scoreContribution: pattern.scoreContribution, confidence: 0.82, title: pattern.title, explanation: pattern.explanation, evidence, recommendation: pattern.recommendation };
}

export const contentRules: readonly AnalysisRule[] = contentPatterns.map((pattern) => ({
  id: pattern.id,
  category: "content",
  analyze: (message: EmailMessage) => {
    const match = pattern.pattern.exec(message.bodyText);
    return match ? [createFinding(pattern, { matchedText: match[0] })] : [];
  },
}));

export function runContentRules(message: EmailMessage, _context: AnalysisContext): SecurityFinding[] {
  return contentRules.flatMap((rule) => rule.analyze(message, _context));
}