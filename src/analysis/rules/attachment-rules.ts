import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailAttachment, EmailMessage } from "../../models/email";

const EXECUTABLE_EXTENSIONS = new Set(["exe", "scr", "bat", "cmd", "com", "msi", "js", "jse", "vbs", "vbe", "ps1", "hta", "jar", "lnk", "iso", "img", "dll"]);
const MACRO_EXTENSIONS = new Set(["docm", "xlsm", "pptm"]);
const ARCHIVE_EXTENSIONS = new Set(["zip", "rar", "7z"]);

function extensionOf(attachment: EmailAttachment): string | null {
  return attachment.extension?.toLowerCase() ?? /\.([a-z0-9]{1,10})$/i.exec(attachment.filename)?.[1]?.toLowerCase() ?? null;
}

function attachmentFinding(attachment: EmailAttachment, ruleId: string, severity: SecurityFinding["severity"], scoreContribution: number, title: string, explanation: string, recommendation: string, evidence: Record<string, unknown>): SecurityFinding {
  return { id: `${ruleId}:${attachment.id}`, ruleId, category: "attachments", severity, scoreContribution, confidence: 0.95, title, explanation, evidence, recommendation, targetElementId: attachment.id };
}

export const attachmentRules: readonly AnalysisRule[] = [
  { id: "ATTACHMENT_EXECUTABLE", category: "attachments", analyze: (message) => message.attachments.filter((attachment) => EXECUTABLE_EXTENSIONS.has(extensionOf(attachment) ?? "")).map((attachment) => attachmentFinding(attachment, "ATTACHMENT_EXECUTABLE", "high", 20, "Attachment can contain executable code", "The visible attachment uses an extension commonly associated with executable or script content.", "Do not download or open the attachment. Confirm it through a trusted channel.", { filename: attachment.filename, extension: extensionOf(attachment) })) },
  { id: "ATTACHMENT_DOUBLE_EXTENSION", category: "attachments", analyze: (message) => message.attachments.filter((attachment) => /\.[a-z0-9]{1,10}\.[a-z0-9]{1,10}$/i.test(attachment.filename)).map((attachment) => attachmentFinding(attachment, "ATTACHMENT_DOUBLE_EXTENSION", "high", 22, "Attachment uses a double extension", "The filename contains multiple extensions, which can hide a dangerous final file type behind a familiar-looking name.", "Do not open the attachment. Verify the file through a trusted sender and channel.", { filename: attachment.filename })) },
  { id: "ATTACHMENT_MACRO_DOCUMENT", category: "attachments", analyze: (message) => message.attachments.filter((attachment) => MACRO_EXTENSIONS.has(extensionOf(attachment) ?? "")).map((attachment) => attachmentFinding(attachment, "ATTACHMENT_MACRO_DOCUMENT", "high", 18, "Attachment is a macro-enabled document", "The document type can contain macros that execute actions when enabled.", "Do not enable macros. Confirm the document through a trusted channel before opening it.", { filename: attachment.filename, extension: extensionOf(attachment) })) },
  { id: "ATTACHMENT_ARCHIVE", category: "attachments", analyze: (message) => message.attachments.filter((attachment) => ARCHIVE_EXTENSIONS.has(extensionOf(attachment) ?? "")).map((attachment) => attachmentFinding(attachment, "ATTACHMENT_ARCHIVE", "medium", 5, "Attachment is an archive", "Archives can conceal their final contents and are sometimes used to bypass simple attachment filters.", "Do not extract the archive unless the sender and expected contents are independently verified.", { filename: attachment.filename, extension: extensionOf(attachment) })) },
];

export function runAttachmentRules(message: EmailMessage, _context: AnalysisContext): SecurityFinding[] {
  return attachmentRules.flatMap((rule) => rule.analyze(message, _context));
}