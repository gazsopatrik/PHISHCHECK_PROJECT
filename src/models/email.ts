export interface EmailAddress {
  displayName: string | null;
  address: string | null;
}

export interface ExtractedLink {
  id: string;
  displayText: string;
  rawHref: string;
  normalizedUrl: string | null;
  hostname: string | null;
  protocol: string | null;
  isButton: boolean;
  sourceElementDescription: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  extension: string | null;
  displayedSize: string | null;
}

export interface EmailMessage {
  provider: "gmail";
  sender: EmailAddress | null;
  recipients: EmailAddress[];
  subject: string | null;
  bodyText: string;
  bodyHtml: string | null;
  links: ExtractedLink[];
  attachments: EmailAttachment[];
  visibleWarnings: string[];
  extractedAt: string;
  extractionWarnings: string[];
}