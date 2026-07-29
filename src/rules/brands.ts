import type { BrandDefinition } from "../models/analysis";

export const commonBrands: readonly BrandDefinition[] = [
  { name: "Microsoft", domains: ["microsoft.com", "microsoftonline.com"], keywords: ["microsoft", "office 365", "office365"] },
  { name: "Google", domains: ["google.com", "googleusercontent.com"], keywords: ["google", "gmail"] },
  { name: "PayPal", domains: ["paypal.com"], keywords: ["paypal"] },
  { name: "Apple", domains: ["apple.com", "icloud.com"], keywords: ["apple", "icloud"] },
  { name: "Amazon", domains: ["amazon.com", "amazon.co.uk"], keywords: ["amazon"] },
  { name: "DHL", domains: ["dhl.com"], keywords: ["dhl"] },
  { name: "DocuSign", domains: ["docusign.com"], keywords: ["docusign", "docu sign"] },
];