import { domainsMatchOrRelated, getRegistrableDomain, isIpAddress, isPunycodeHostname } from "./domains";

const COMMON_SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "is.gd", "ow.ly", "shorturl.at", "rebrand.ly"]);
const REDIRECT_PARAMETERS = /^(redirect|redir|url|target|dest|destination|continue|next|return|returnto)$/i;

export interface ParsedUrl {
  raw: string;
  normalized: string | null;
  hostname: string | null;
  protocol: string | null;
  path: string | null;
  isIp: boolean;
  isPunycode: boolean;
}

export function parseUrl(rawUrl: string, baseUrl = "https://mail.google.com"): ParsedUrl {
  if (/\s/.test(rawUrl)) return { raw: rawUrl, normalized: null, hostname: null, protocol: null, path: null, isIp: false, isPunycode: false };
  try {
    const url = new URL(rawUrl, baseUrl);
    return {
      raw: rawUrl,
      normalized: url.href,
      hostname: url.hostname || null,
      protocol: url.protocol.replace(":", "") || null,
      path: url.pathname || null,
      isIp: isIpAddress(url.hostname),
      isPunycode: isPunycodeHostname(url.hostname),
    };
  } catch {
    return { raw: rawUrl, normalized: null, hostname: null, protocol: null, path: null, isIp: false, isPunycode: false };
  }
}

export function isCommonShortener(hostname: string | null): boolean {
  const domain = hostname ? getRegistrableDomain(hostname) : null;
  return domain !== null && COMMON_SHORTENERS.has(domain);
}

export function isLoginLikeUrl(url: ParsedUrl): boolean {
  return /(?:login|signin|sign-in|verify|auth|account|password|credential|reset)/i.test(url.path ?? "");
}

export function hasSuspiciousRedirectParameter(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return [...url.searchParams.keys()].some((key) => REDIRECT_PARAMETERS.test(key));
  } catch {
    return false;
  }
}

export function visibleTextSuggestsDifferentDomain(displayText: string, destinationHostname: string | null): boolean {
  if (!destinationHostname) return false;
  const displayUrl = parseUrl(displayText);
  if (!displayUrl.hostname) return false;
  return !domainsMatchOrRelated(displayUrl.hostname, destinationHostname);
}