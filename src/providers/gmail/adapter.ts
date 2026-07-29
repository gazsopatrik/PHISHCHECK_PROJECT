import type {
  EmailAddress,
  EmailAttachment,
  EmailMessage,
  ExtractedLink,
} from "../../models/email";
import type { EmailProviderAdapter, SecurityFindingTarget } from "../../models/provider";
import { gmailSelectors } from "./selectors";

const GMAIL_HOSTNAME = "mail.google.com";
const HIGHLIGHT_CLASS = "phishcheck-highlight";
const HIGHLIGHT_ATTRIBUTE = "data-phishcheck-highlight";

interface GmailAdapterEnvironment {
  document: Document;
  location: Pick<Location, "hostname" | "href">;
}

export class GmailProviderAdapter implements EmailProviderAdapter {
  private readonly environment: GmailAdapterEnvironment;

  public constructor(environment: GmailAdapterEnvironment = { document, location }) {
    this.environment = environment;
  }

  public isSupportedPage(): boolean {
    return this.environment.location.hostname === GMAIL_HOSTNAME;
  }

  public isEmailOpen(): boolean {
    return this.isSupportedPage() && this.findFirst(gmailSelectors.body) !== null;
  }

  public async extractCurrentEmail(): Promise<EmailMessage> {
    if (!this.isSupportedPage()) {
      throw new Error("Gmail is not the current page.");
    }

    const extractionWarnings: string[] = [];
    const bodyElement = this.findFirst(gmailSelectors.body);

    if (!bodyElement) {
      throw new Error("No open Gmail message could be reliably identified.");
    }

    const sender = this.extractAddress(this.findFirst(gmailSelectors.sender));
    if (!sender?.address) extractionWarnings.push("Sender address was not visible in the Gmail UI.");

    const subjectElement = this.findFirst(gmailSelectors.subject);
    const subject = this.cleanText(subjectElement?.textContent) || null;
    if (!subject) extractionWarnings.push("Subject was not visible in the Gmail UI.");

    const bodyText = this.cleanText(bodyElement.textContent) ?? "";
    if (!bodyText) extractionWarnings.push("The visible message body was empty or unavailable.");

    const links = this.extractLinks(bodyElement);
    const attachments = this.extractAttachments();
    const recipients = this.extractRecipients(sender);
    const visibleWarnings = this.extractVisibleWarnings();

    if (bodyElement.innerHTML === "") {
      extractionWarnings.push("Message HTML was unavailable; only limited text extraction is possible.");
    }

    return {
      provider: "gmail",
      sender,
      recipients,
      subject,
      bodyText,
      bodyHtml: bodyElement.innerHTML || null,
      links,
      attachments,
      visibleWarnings,
      extractedAt: new Date().toISOString(),
      extractionWarnings,
    };
  }

  public highlightFinding(finding: SecurityFindingTarget): void {
    const targetId = finding.targetElementId;
    if (!targetId) return;

    const target = this.environment.document.querySelector<HTMLElement>(
      `[data-phishcheck-id="${this.escapeAttribute(targetId)}"]`,
    );
    if (!target) return;

    target.classList.add(HIGHLIGHT_CLASS);
    target.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
  }

  public clearHighlights(): void {
    this.environment.document.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTRIBUTE}]`).forEach((element) => {
      element.classList.remove(HIGHLIGHT_CLASS);
      element.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    });
  }

  private findFirst(selectors: readonly string[]): HTMLElement | null {
    for (const selector of selectors) {
      const element = this.environment.document.querySelector<HTMLElement>(selector);
      if (element) return element;
    }
    return null;
  }

  private extractAddress(element: Element | null): EmailAddress | null {
    if (!element) return null;
    const address = element.getAttribute("email")?.trim() || null;
    const displayName = this.cleanText(element.textContent) || element.getAttribute("name") || null;
    if (!address && !displayName) return null;
    return { displayName, address };
  }

  private extractRecipients(sender: EmailAddress | null): EmailAddress[] {
    const seen = new Set<string>();
    const recipients: EmailAddress[] = [];
    for (const selector of gmailSelectors.recipient) {
      this.environment.document.querySelectorAll(selector).forEach((element) => {
        const address = this.extractAddress(element);
        const key = address?.address?.toLowerCase();
        if (!address || !key || key === sender?.address?.toLowerCase() || seen.has(key)) return;
        seen.add(key);
        recipients.push(address);
      });
    }
    return recipients;
  }

  private extractLinks(bodyElement: Element): ExtractedLink[] {
    return Array.from(bodyElement.querySelectorAll<HTMLAnchorElement>("a[href]"), (link, index) => {
      const rawHref = link.getAttribute("href")?.trim() ?? "";
      let normalizedUrl: string | null = null;
      let hostname: string | null = null;
      let protocol: string | null = null;
      try {
        const parsed = new URL(rawHref, this.environment.location.href);
        normalizedUrl = parsed.href;
        hostname = parsed.hostname || null;
        protocol = parsed.protocol.replace(":", "") || null;
      } catch {
        // Malformed URLs are preserved as raw evidence for later rules.
      }

      const id = `gmail-link-${index + 1}`;
      link.setAttribute("data-phishcheck-id", id);
      return {
        id,
        displayText: this.cleanText(link.textContent) ?? "",
        rawHref,
        normalizedUrl,
        hostname,
        protocol,
        isButton: link.getAttribute("role") === "button" || link.classList.contains("acZ"),
        sourceElementDescription: this.describeElement(link),
      };
    });
  }

  private extractAttachments(): EmailAttachment[] {
    const seen = new Set<string>();
    const attachments: EmailAttachment[] = [];
    for (const selector of gmailSelectors.attachments) {
      this.environment.document.querySelectorAll(selector).forEach((element, index) => {
        const filename = this.cleanText(element.getAttribute("download")) ||
          this.cleanText(element.getAttribute("data-tooltip")) ||
          this.cleanText(element.textContent);
        if (!filename || seen.has(filename)) return;
        seen.add(filename);
        const extensionMatch = /\.([a-z0-9]{1,10})(?:\s|$)/i.exec(filename);
        attachments.push({
          id: `gmail-attachment-${attachments.length + index + 1}`,
          filename,
          extension: extensionMatch?.[1]?.toLowerCase() ?? null,
          displayedSize: this.cleanText(element.parentElement?.textContent)?.replace(filename, "").trim() || null,
        });
      });
    }
    return attachments;
  }

  private extractVisibleWarnings(): string[] {
    const warnings = new Set<string>();
    for (const selector of gmailSelectors.warnings) {
      this.environment.document.querySelectorAll(selector).forEach((element) => {
        const text = this.cleanText(element.textContent);
        if (text) warnings.add(text);
      });
    }
    return [...warnings];
  }

  private cleanText(value: string | null | undefined): string | null {
    const cleaned = value?.replace(/\s+/g, " ").trim();
    return cleaned || null;
  }

  private describeElement(element: Element): string {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    return role ? `${tag}[role="${role}"]` : tag;
  }

  private escapeAttribute(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
}