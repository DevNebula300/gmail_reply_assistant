import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
  matches: ["https://mail.google.com/*"],
  runAt: "document_idle",
  main() {
    const BUTTON_ID = "gra-ai-reply-button";

    function getThreadIdFromUrl(): string | null {
      const match = window.location.hash.match(/\/([a-zA-Z0-9]+)$/);
      return match?.[1] ?? null;
    }

    function injectButton() {
      if (document.getElementById(BUTTON_ID)) {
        return;
      }

      const toolbar = document.querySelector('[gh="tm"]') ?? document.querySelector(".G-atb");
      if (!toolbar) {
        return;
      }

      const button = document.createElement("button");
      button.id = BUTTON_ID;
      button.type = "button";
      button.textContent = "AI Reply";
      button.title = "Open Gmail Reply Assistant";
      button.className = "gra-ai-reply-button";
      button.style.cssText = [
        "margin-left: 8px",
        "padding: 6px 12px",
        "border-radius: 16px",
        "border: 1px solid #dadce0",
        "background: #fff",
        "color: #1a73e8",
        "font-size: 13px",
        "font-weight: 500",
        "cursor: pointer",
      ].join(";");

      button.addEventListener("click", async () => {
        const threadId = getThreadIdFromUrl();
        await chrome.runtime.sendMessage({
          type: "OPEN_SIDE_PANEL",
          threadId,
        });
      });

      toolbar.appendChild(button);
    }

    const observer = new MutationObserver(() => injectButton());
    observer.observe(document.body, { childList: true, subtree: true });
    injectButton();
  },
});
