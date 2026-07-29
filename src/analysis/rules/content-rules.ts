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
  {
    id: "CONTENT_URGENCY",
    pattern: /\b(immediate action|required immediately|act now|urgent|within \d+ hours|account will be suspended)\b/i,
    severity: "low",
    scoreContribution: 5,
    title: "Urgent language is present",
    explanation: "The message uses time pressure or a threat of account consequences to encourage immediate action.",
    recommendation: "Pause and verify the request through a trusted channel before acting.",
  },
  {
    id: "CONTENT_CREDENTIAL_REQUEST",
    pattern: /\b(verify|confirm|reset|update|send|provide|enter|share|give).{0,80}\b(password|login|credential|authentication code|verification code|one[- ]?time code|passcode|sign[- ]?in)\b|\b(password|login|credential|authentication code|verification code|one[- ]?time code|passcode|sign[- ]?in).{0,80}\b(send|provide|enter|share|give|verify|confirm|reset|update)\b/i,
    severity: "high",
    scoreContribution: 15,
    title: "The message requests account credentials",
    explanation: "The content appears to ask the recipient to verify, provide, reset, or enter credentials or authentication data.",
    recommendation: "Do not provide credentials or codes through the message. Open the official service manually.",
  },
  {
    id: "CONTENT_FINANCIAL_REQUEST",
    pattern: /\b(send money|wire|transfer|pay|purchase|buy).{0,100}\b(payment|invoice|bank account|billing|refund|money|gift card|account)\b|\b(payment|invoice|bank account|billing|refund|money).{0,100}\b(send money|wire|transfer|pay|purchase|buy)\b/i,
    severity: "high",
    scoreContribution: 12,
    title: "The message contains a financial request",
    explanation: "The message combines financial terms with a request for action or confirmation.",
    recommendation: "Verify payment instructions using a known contact or an independently opened service.",
  },
  {
    id: "CONTENT_GIFT_CARD_REQUEST",
    pattern: /\b(gift cards?|itunes cards?|apple cards?|google play cards?|voucher codes?)\b/i,
    severity: "high",
    scoreContribution: 15,
    title: "The message mentions gift cards or voucher codes",
    explanation: "Gift-card purchases and voucher-code requests are common social-engineering patterns.",
    recommendation: "Do not purchase or send codes based on an email request. Confirm the request in person or by phone.",
  },
  {
    id: "CONTENT_REMOTE_ACCESS_REQUEST",
    pattern: /\b(anydesk|teamviewer|remote desktop|remote access|screen sharing|install software|enable macros?)\b/i,
    severity: "high",
    scoreContribution: 15,
    title: "The message requests remote access or risky software action",
    explanation: "The content asks for remote access, screen sharing, software installation, or macro execution.",
    recommendation: "Do not install software or enable macros from the message. Contact your organization through a trusted channel.",
  },
  {
    id: "CONTENT_ADULT_SCAM_LURE",
    pattern: /\b(last longer|sexual performance|sex(?:ual)? technique|hypnotic.{0,40}(?:sex|arousal|orgasm)|hyperactive arousal|orgasm|climax|pleasure (?:a )?woman|vag[1i]na)\b/i,
    severity: "high",
    scoreContribution: 18,
    title: "The message uses an adult-content sales lure",
    explanation: "The content uses sexual-performance or adult-content claims commonly found in deceptive marketing and spam campaigns.",
    recommendation: "Do not follow the message links. Delete or report the message as spam unless you independently recognize the sender.",
  },
  {
    id: "CONTENT_OBFUSCATED_WORDING",
    pattern: /\b(?:s3x|vag1na|org4sm|cl1ck|fr[e3]{2})\b/i,
    severity: "medium",
    scoreContribution: 12,
    title: "The message disguises words with character substitutions",
    explanation: "Character substitutions can be used to evade spam filters or make a mass-marketing message appear less detectable.",
    recommendation: "Treat the message as suspicious and avoid interacting with its links.",
  },
  {
    id: "CONTENT_UNVERIFIABLE_PROMISE",
    pattern: /\b(helped thousands|as little as \d+ days|stanford discovered|secret technique|powerful hypnosis|guaranteed results?|miracle)\b/i,
    severity: "medium",
    scoreContribution: 8,
    title: "The message makes an unverifiable promotional claim",
    explanation: "The wording relies on broad social proof, authority, or rapid-results claims without verifiable evidence.",
    recommendation: "Do not rely on the claim or follow its links without independently verifying the sender and offer.",
  },
];

function createFinding(pattern: ContentPattern, evidence: Record<string, unknown>): SecurityFinding {
  return {
    id: pattern.id,
    ruleId: pattern.id,
    category: "content",
    severity: pattern.severity,
    scoreContribution: pattern.scoreContribution,
    confidence: 0.82,
    title: pattern.title,
    explanation: pattern.explanation,
    evidence,
    targetElementId: "gmail-message-body",
    recommendation: pattern.recommendation,
  };
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

