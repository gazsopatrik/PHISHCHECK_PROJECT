import type { AnalysisResult } from "../models/analysis";
import type { EmailMessage } from "../models/email";
import type { SecurityFindingTarget } from "../models/provider";

export type PhishCheckMessage =
  | "PHISHCHECK_PING"
  | "PHISHCHECK_EXTRACT_EMAIL"
  | "PHISHCHECK_CLEAR_HIGHLIGHTS"
  | { type: "PHISHCHECK_HIGHLIGHT"; finding: SecurityFindingTarget };

export interface PhishCheckResponse {
  ok: boolean;
  supported?: boolean;
  email?: EmailMessage;
  result?: AnalysisResult;
  error?: string;
}