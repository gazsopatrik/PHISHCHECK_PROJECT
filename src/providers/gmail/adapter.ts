import type {
  EmailAddress,
  EmailAttachment,
  EmailMessage,
  ExtractedLink,
} from "../../models/email";
import type { EmailProviderAdapter, SecurityFindingTarget } from "../../models/provider";
import { gmailSelectors } from "./selectors";

const GMAIL_HOSTNAMES = new Set(["mail.google.com", "gmail.com", "www.gmail.com"]);
const HIGHLIGHT_CLASS = "phishcheck-highlight";
const HIGHLIGHT_ATTRIBUTE = "data-phishcheck-highlight";
const TEXT_HIGHLIGHT_ATTRIBUTE = "data-phishcheck-text-highlight";
const HIGHLIGHT_STYLE_ID = "phishcheck-highlight-style";

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
    return GMAIL_HOSTNAMES.has(this.environment.location.hostname);
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
    bodyElement.setAttribute("data-phishcheck-id", "gmail-message-body");

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
    const evidence = finding.evidence ?? {};
    const matchedText = typeof evidence.matchedText === "string" ? evidence.matchedText : null;
    this.ensureHighlightStyle();
    if (targetId === "gmail-message-body" && target && matchedText && this.highlightText(target, matchedText)) {
      return;
    }
    if (target) {
      this.applyHighlight(target);
      return;
    }

    const rawHref = typeof evidence.rawHref === "string" ? evidence.rawHref : null;
    const hostname = typeof evidence.actualHostname === "string" ? evidence.actualHostname : null;
    this.environment.document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      let matches = rawHref !== null && link.getAttribute("href")?.trim() === rawHref;
      if (!matches && hostname) {
        try {
          matches = new URL(link.href, this.environment.location.href).hostname === hostname;
        } catch {
          matches = false;
        }
      }
      if (matches) {
        this.applyHighlight(link);
      }
    });
  }

  public clearHighlights(): void {
    this.environment.document.querySelectorAll<HTMLElement>(`[${TEXT_HIGHLIGHT_ATTRIBUTE}]`).forEach((element) => {
      const parent = element.parentNode;
      if (!parent) return;
      while (element.firstChild) parent.insertBefore(element.firstChild, element);
      parent.removeChild(element);
      parent.normalize();
    });
    this.environment.document.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTRIBUTE}]`).forEach((element) => {
      element.classList.remove(HIGHLIGHT_CLASS);
      element.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    });
    this.environment.document.getElementById(HIGHLIGHT_STYLE_ID)?.remove();
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
        const id = `gmail-attachment-${attachments.length + index + 1}`;
        element.setAttribute("data-phishcheck-id", id);
        attachments.push({
          id,
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

  private applyHighlight(element: HTMLElement): void {
    element.classList.add(HIGHLIGHT_CLASS);
    element.setAttribute(HIGHLIGHT_ATTRIBUTE, "true");
  }

  private highlightText(container: HTMLElement, matchedText: string): boolean {
    const needle = matchedText.trim();
    if (!needle) return false;
    const needleLower = needle.toLocaleLowerCase();
    const textNodes: Text[] = [];
    const elements = [container, ...Array.from(container.querySelectorAll<HTMLElement>("*"))];

    for (const element of elements) {
      if (element.closest(`[${HIGHLIGHT_ATTRIBUTE}]`)) continue;
      for (const child of Array.from(element.childNodes)) {
        if (child.nodeType !== 3) continue; // Text node
        const node = child as Text;
        if (node.data.toLocaleLowerCase().includes(needleLower)) textNodes.push(node);
      }
    }

    for (const node of textNodes) {
      const parent = node.parentNode;
      if (!parent) continue;
      const source = node.data;
      const sourceLower = source.toLocaleLowerCase();
      const fragment = this.environment.document.createDocumentFragment();
      let offset = 0;
      let matchIndex = sourceLower.indexOf(needleLower, offset);

      while (matchIndex >= 0) {
        if (matchIndex > offset) fragment.append(this.environment.document.createTextNode(source.slice(offset, matchIndex)));
        const highlight = this.environment.document.createElement("span");
        highlight.setAttribute(TEXT_HIGHLIGHT_ATTRIBUTE, "true");
        highlight.textContent = source.slice(matchIndex, matchIndex + needle.length);
        this.applyHighlight(highlight);
        fragment.append(highlight);
        offset = matchIndex + needle.length;
        matchIndex = sourceLower.indexOf(needleLower, offset);
      }
      if (offset < source.length) fragment.append(this.environment.document.createTextNode(source.slice(offset)));
      parent.replaceChild(fragment, node);
    }

    return textNodes.length > 0;
  }

  private ensureHighlightStyle(): void {
    if (this.environment.document.getElementById(HIGHLIGHT_STYLE_ID)) return;
    const style = this.environment.document.createElement("style");
    style.id = HIGHLIGHT_STYLE_ID;
    style.textContent = `.${HIGHLIGHT_CLASS} { outline: 2px solid #ffb347 !important; outline-offset: 2px !important; background-color: rgba(255, 179, 71, 0.16) !important; }`;
    this.environment.document.head?.append(style);
  }
}

