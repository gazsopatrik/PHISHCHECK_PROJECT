import type { EmailMessage } from "./email";

export type FindingCategory = "sender" | "links" | "content" | "attachments" | "consistency" | "missing-information";
export type FindingSeverity = "info" | "low" | "medium" | "high" | "critical";

export interface SecurityFinding {
  id: string;
  ruleId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  scoreContribution: number;
  confidence: number;
  title: string;
  explanation: string;
  evidence: Record<string, unknown>;
  recommendation: string;
  targetElementId?: string;
}

export interface BrandDefinition {
  name: string;
  domains: string[];
  keywords: string[];
}

export interface AnalysisContext {
  brands: readonly BrandDefinition[];
}

export interface AnalysisRule {
  id: string;
  category: FindingCategory;
  analyze(message: EmailMessage, context: AnalysisContext): SecurityFinding[];
}