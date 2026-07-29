import type { ConfidenceLevel } from "../../models/analysis";
import type { EmailMessage } from "../../models/email";

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevel;
  limitations: string[];
}

export function calculateConfidence(message: EmailMessage): ConfidenceResult {
  let score = 75;
  const limitations: string[] = [
    "The analysis uses visible Gmail content only; it does not verify full email headers, sender authentication, URL reputation, or attachment contents.",
  ];

  if (!message.sender?.address) {
    score -= 15;
    limitations.push("The sender address was unavailable or could not be verified from the visible Gmail UI.");
  }
  if (!message.subject) {
    score -= 5;
    limitations.push("The subject was unavailable.");
  }
  if (!message.bodyText.trim()) {
    score -= 20;
    limitations.push("The visible message body was empty or unavailable.");
  }
  if (!message.bodyHtml) {
    score -= 5;
    limitations.push("Only plain text was available; some visual indicators may be missing.");
  }
  if (message.extractionWarnings.length > 0) {
    score -= Math.min(30, message.extractionWarnings.length * 10);
    limitations.push(...message.extractionWarnings);
  }

  const normalizedScore = Math.max(0, Math.min(100, score));
  return {
    score: normalizedScore,
    level: normalizedScore >= 75 ? "high" : normalizedScore >= 50 ? "medium" : "low",
    limitations: [...new Set(limitations)],
  };
}

