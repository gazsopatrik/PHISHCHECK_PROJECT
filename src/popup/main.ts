import "./styles.css";
import { analyzeMessage } from "../analysis/engine";
import { commonBrands } from "../rules/brands";
import type { AnalysisResult, SecurityFinding } from "../models/analysis";
import type { PhishCheckResponse } from "../shared/messages";

const app = document.querySelector<HTMLElement>("#app");

if (app) renderStart();

function textElement(tag: keyof HTMLElementTagNameMap, text: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function renderStart(message = "Open an email in Gmail, then start the analysis."): void {
  if (!app) return;
  const section = document.createElement("section");
  section.className = "panel";
  section.setAttribute("aria-labelledby", "title");
  const header = document.createElement("header");
  const title = textElement("h1", "PhishCheck");
  title.id = "title";
  header.append(textElement("p", "Opera GX · Gmail", "eyebrow"), title, textElement("p", message, "status"));
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Analyze Email";
  button.addEventListener("click", () => void analyzeCurrentEmail(button));
  section.append(header, button, textElement("p", "Risk indicators are not a guarantee. Always verify sensitive requests through a trusted channel.", "disclaimer"));
  app.replaceChildren(section);
}

async function analyzeCurrentEmail(button: HTMLButtonElement): Promise<void> {
  button.disabled = true;
  button.textContent = "Analyzing…";
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (tabId === undefined) throw new Error("No active browser tab was found.");
    const supported = await chrome.tabs.sendMessage(tabId, "PHISHCHECK_PING") as PhishCheckResponse;
    if (!supported?.ok || !supported.supported) {
      renderStart("Open an email in Gmail, then run the analysis again.");
      return;
    }
    const response = await chrome.tabs.sendMessage(tabId, "PHISHCHECK_EXTRACT_EMAIL") as PhishCheckResponse;
    if (!response?.ok || !response.email) throw new Error(response?.error ?? "PhishCheck could not extract this email.");
    renderResult(analyzeMessage(response.email, { brands: commonBrands }));
  } catch (error: unknown) {
    renderStart(toUserFacingError(error));
  }
}

function toUserFacingError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("No open Gmail message") || message.includes("Receiving end does not exist")) return "Open an email in Gmail, then run the analysis again.";
  if (message.includes("Gmail is not the current page")) return "Open Gmail and an email message before starting the analysis.";
  if (message) return `PhishCheck could not reliably extract this email: ${message}`;
  return "PhishCheck could not analyze this page.";
}

function renderResult(result: AnalysisResult): void {
  if (!app) return;
  const section = document.createElement("section");
  section.className = "panel result";
  const heading = textElement("h1", "PhishCheck");
  const score = textElement("p", `${result.riskScore}/100 · ${result.riskLevel.toUpperCase()}`, `risk risk-${result.riskLevel}`);
  const confidence = textElement("p", `${result.confidenceLevel} confidence (${result.confidenceScore}/100)`, "confidence");
  const summary = textElement("p", result.summary, "summary");
  const findings = document.createElement("div");
  findings.className = "findings";
  result.findings.forEach((finding) => findings.append(createFinding(finding)));
  const highlightControls = document.createElement("div");
  highlightControls.className = "highlight-controls";
  const highlightButton = document.createElement("button");
  highlightButton.type = "button";
  highlightButton.textContent = "Highlight Suspicious Content";
  highlightButton.addEventListener("click", () => void highlightFindings(result));
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "secondary-button";
  clearButton.textContent = "Remove Highlights";
  clearButton.addEventListener("click", () => void clearHighlights());
  highlightControls.append(highlightButton, clearButton);
  const rerun = document.createElement("button");
  rerun.type = "button";
  rerun.textContent = "Analyze Again";
  rerun.addEventListener("click", () => renderStart());
  section.append(heading, score, confidence, summary, findings, highlightControls, rerun);
  if (result.limitations.length > 0) {
    const limitations = document.createElement("p");
    limitations.className = "limitations";
    limitations.textContent = `Limitations: ${result.limitations.join(" ")}`;
    section.append(limitations);
  }
  app.replaceChildren(section);
}

function createFinding(finding: SecurityFinding): HTMLElement {
  const article = document.createElement("article");
  article.className = `finding severity-${finding.severity}`;
  article.append(textElement("h2", finding.title), textElement("p", `${finding.category} · ${finding.severity} · +${finding.scoreContribution}`, "finding-meta"), textElement("p", finding.explanation), textElement("p", `Recommended action: ${finding.recommendation}`));
  return article;
}

async function activeTabId(): Promise<number> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (tabId === undefined) throw new Error("No active browser tab was found.");
  return tabId;
}

async function highlightFindings(result: AnalysisResult): Promise<void> {
  try {
    const tabId = await activeTabId();
    await Promise.all(result.findings.filter((finding) => finding.targetElementId).map((finding) => chrome.tabs.sendMessage(tabId, { type: "PHISHCHECK_HIGHLIGHT", finding })));
  } catch {
    // The result remains usable when the Gmail page is no longer available.
  }
}

async function clearHighlights(): Promise<void> {
  try {
    const tabId = await activeTabId();
    await chrome.tabs.sendMessage(tabId, "PHISHCHECK_CLEAR_HIGHLIGHTS");
  } catch {
    // The page may have navigated away or the content script may have been reloaded.
  }
}