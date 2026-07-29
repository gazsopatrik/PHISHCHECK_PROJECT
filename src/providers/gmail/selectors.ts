export const gmailSelectors = {
  messageRoot: [
    "[data-message-id]",
    "div[role=main] .ii.gt",
    "div[role=main] .a3s.aiL",
  ],
  body: [
    ".a3s.aiL",
    "[data-message-id] .a3s",
    "div[role=main] .ii.gt",
  ],
  subject: ["h2.hP", "[role=main] h2"],
  sender: ["[data-message-id] span[email]", "[role=main] h3 span[email]", "span[email]"],
  recipient: ["[data-message-id] span[email]", "[role=main] span[email]"],
  warnings: ["[role=main] [role=alert]", "[role=main] .adn"],
  attachments: [
    "[role=main] [download]",
    "[role=main] [data-tooltip*='Download']",
    "[role=main] .aZo",
  ],
} as const;