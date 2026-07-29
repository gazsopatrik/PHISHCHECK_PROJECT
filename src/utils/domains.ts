const MULTI_LABEL_PUBLIC_SUFFIXES = new Set(["co.uk", "org.uk", "gov.uk", "com.au", "co.jp", "co.nz"]);

export function normalizeHostname(hostname: string): string | null {
  const normalized = hostname.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  if (!normalized || normalized.includes(" ")) return null;
  try {
    return new URL(`https://${normalized}`).hostname.replace(/\.$/, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isPunycodeHostname(hostname: string): boolean {
  return normalizeHostname(hostname)?.split(".").some((label) => label.startsWith("xn--")) ?? false;
}

export function isIpAddress(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return false;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    return normalized.split(".").every((part) => Number(part) <= 255);
  }
  return normalized.includes(":");
}

export function getRegistrableDomain(hostname: string): string | null {
  const normalized = normalizeHostname(hostname);
  if (!normalized || isIpAddress(normalized)) return normalized;
  const labels = normalized.split(".");
  if (labels.length < 2) return normalized;
  const suffixLength = MULTI_LABEL_PUBLIC_SUFFIXES.has(labels.slice(-2).join(".")) ? 2 : 1;
  if (labels.length <= suffixLength) return normalized;
  return labels.slice(-(suffixLength + 1)).join(".");
}

export function domainsMatchOrRelated(left: string, right: string): boolean {
  const leftDomain = getRegistrableDomain(left);
  const rightDomain = getRegistrableDomain(right);
  return leftDomain !== null && leftDomain === rightDomain;
}

export function levenshteinDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0] ?? 0;
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column] ?? column;
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      previous[column] = Math.min(previous[column - 1]! + 1, above + 1, diagonal + cost);
      diagonal = above;
    }
  }
  return previous[right.length] ?? 0;
}