import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";

function missingFinding(id: string, title: string, explanation: string, evidence: Record<string, unknown>): SecurityFinding {
  return { id, ruleId: id, category: "missing-information", severity: "info", scoreContribution: 0, confidence: 0.98, title, explanation, evidence, recommendation: "Treat the result as limited and verify sensitive requests through a trusted channel." };
}

export const missingInformationRules: readonly AnalysisRule[] = [
  {
    id: "MISSING_SENDER_ADDRESS",
    category: "missing-information",
    analyze: (message) => message.sender?.address ? [] : [missingFinding("MISSING_SENDER_ADDRESS", "Sender address is unavailable", "The visible Gmail interface did not expose a sender address that could be analyzed.", { senderPresent: Boolean(message.sender) })],
  },
  {
    id: "MISSING_BODY_CONTENT",
    category: "missing-information",
    analyze: (message) => message.bodyText.trim() ? [] : [missingFinding("MISSING_BODY_CONTENT", "Message body is unavailable", "The analyzer could not inspect visible message text.", { bodyLength: message.bodyText.length })],
  },
  {
    id: "EXTRACTION_WARNING",
    category: "missing-information",
    analyze: (message) => message.extractionWarnings.map((warning, index) => missingFinding(`EXTRACTION_WARNING:${index + 1}`, "Email extraction was incomplete", warning, { warning })),
  },
];

export function runMissingInformationRules(message: EmailMessage, _context: AnalysisContext): SecurityFinding[] {
  return missingInformationRules.flatMap((rule) => rule.analyze(message, _context));
}

