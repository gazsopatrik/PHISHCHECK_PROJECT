import type { AnalysisContext, AnalysisRule, SecurityFinding } from "../../models/analysis";
import type { EmailMessage, ExtractedLink } from "../../models/email";
import { isCommonShortener, isLoginLikeUrl, hasSuspiciousRedirectParameter, parseUrl, visibleTextSuggestsDifferentDomain } from "../../utils/urls";

function finding(link: ExtractedLink, ruleId: string, severity: SecurityFinding["severity"], scoreContribution: number, title: string, explanation: string, recommendation: string, evidence: Record<string, unknown>): SecurityFinding {
  return { id: `${ruleId}:${link.id}`, ruleId, category: "links", severity, scoreContribution, confidence: 0.95, title, explanation, recommendation, evidence, targetElementId: link.id };
}

export const linkRules: readonly AnalysisRule[] = [
  {
    id: "LINK_TEXT_DESTINATION_MISMATCH",
    category: "links",
    analyze: (message) => message.links.filter((link) => visibleTextSuggestsDifferentDomain(link.displayText, link.hostname)).map((link) => finding(link, "LINK_TEXT_DESTINATION_MISMATCH", "high", 20, "Link text does not match its destination", "The visible link text suggests a different domain than the actual destination.", "Do not open the link. Visit the official website manually.", { displayText: link.displayText, actualHostname: link.hostname })),
  },
  {
    id: "LINK_USES_IP_ADDRESS",
    category: "links",
    analyze: (message) => message.links.filter((link) => parseUrl(link.rawHref).isIp).map((link) => finding(link, "LINK_USES_IP_ADDRESS", "high", 15, "Link uses an IP address", "The destination uses a numeric IP address instead of a recognizable domain.", "Do not open the link unless the destination is independently verified.", { hostname: link.hostname })),
  },
  {
    id: "LINK_USES_HTTP_LOGIN",
    category: "links",
    analyze: (message) => message.links.filter((link) => link.protocol === "http" && isLoginLikeUrl(parseUrl(link.rawHref))).map((link) => finding(link, "LINK_USES_HTTP_LOGIN", "high", 20, "Login-related link does not use HTTPS", "The link appears to lead to a login or account page over unencrypted HTTP.", "Do not enter credentials. Navigate to the official site yourself.", { protocol: link.protocol, path: parseUrl(link.rawHref).path })),
  },
  {
    id: "LINK_PUNYCODE_DOMAIN",
    category: "links",
    analyze: (message) => message.links.filter((link) => parseUrl(link.rawHref).isPunycode).map((link) => finding(link, "LINK_PUNYCODE_DOMAIN", "medium", 12, "Link uses an encoded internationalized domain", "The destination contains punycode, which can make lookalike domains harder to recognize.", "Verify the domain character by character through a trusted route.", { hostname: link.hostname })),
  },
  {
    id: "LINK_URL_SHORTENER",
    category: "links",
    analyze: (message) => message.links.filter((link) => isCommonShortener(link.hostname)).map((link) => finding(link, "LINK_URL_SHORTENER", "medium", 8, "Link uses a common URL shortener", "The shortened URL hides the final destination from the visible email.", "Preview or verify the destination through a trusted channel before opening it.", { hostname: link.hostname })),
  },
  {
    id: "LINK_SUSPICIOUS_REDIRECT_PARAMETER",
    category: "links",
    analyze: (message) => message.links.filter((link) => hasSuspiciousRedirectParameter(link.rawHref)).map((link) => finding(link, "LINK_SUSPICIOUS_REDIRECT_PARAMETER", "medium", 8, "Link contains a redirect parameter", "The URL contains a parameter commonly used to send users through an intermediate destination.", "Do not follow the link without verifying the final destination.", { rawHref: link.rawHref })),
  },
];

export function runLinkRules(message: EmailMessage, context: AnalysisContext): SecurityFinding[] {
  return linkRules.flatMap((rule) => rule.analyze(message, context));
}