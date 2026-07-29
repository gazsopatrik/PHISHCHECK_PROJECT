import type { EmailMessage } from "./email";

export interface SecurityFindingTarget {
  targetElementId?: string;
  evidence?: Record<string, unknown>;
}

export interface EmailProviderAdapter {
  isSupportedPage(): boolean;
  isEmailOpen(): boolean;
  extractCurrentEmail(): Promise<EmailMessage>;
  highlightFinding(finding: SecurityFindingTarget): void;
  clearHighlights(): void;
}

