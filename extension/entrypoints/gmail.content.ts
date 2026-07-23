import { defineContentScript } from "wxt/sandbox";

const KNOWN_VIEW_HASHES = new Set([
  "inbox",
  "sent",
  "drafts",
  "all",
  "starred",
  "snoozed",
  "trash",
  "spam",
  "settings",
  "imp",
  "chats",
  "scheduled",
]);

export function extractThreadIdFromHash(hash: string): string | null {
  if (!hash || hash === "#" || hash === "#inbox") {
    return null;
  }
  const cleanHash = hash.replace(/^#/, "");
  const parts = cleanHash.split("/").filter(Boolean);

  if (parts.length === 1 && KNOWN_VIEW_HASHES.has(parts[0].toLowerCase())) {
    return null;
  }

  const lastPart = parts[parts.length - 1];
  if (!lastPart || KNOWN_VIEW_HASHES.has(lastPart.toLowerCase())) {
    return null;
  }

  // Match thread IDs: e.g. FMfcgzGv... or 16-char hex IDs
  if (/^[a-zA-Z0-9_-]{12,}$/.test(lastPart)) {
    return lastPart;
  }

  return null;
}

export function getThreadIdFromLocationAndDom(): string | null {
  const fromHash = extractThreadIdFromHash(window.location.hash);
  if (fromHash) {
    return fromHash;
  }

  const domEl = document.querySelector<HTMLElement>("[data-thread-id], [data-legacy-thread-id]");
  if (domEl) {
    const id = domEl.getAttribute("data-thread-id") || domEl.getAttribute("data-legacy-thread-id");
    if (id && /^[a-zA-Z0-9_-]{12,}$/.test(id)) {
      return id;
    }
  }

  return null;
}

export default defineContentScript({
  matches: ["https://mail.google.com/*"],
  runAt: "document_idle",
  main() {
    const BUTTON_ID = "gra-ai-reply-button";
    let currentThreadId: string | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function notifyThreadChange(threadId: string | null) {
      if (threadId === currentThreadId) {
        return;
      }
      currentThreadId = threadId;

      if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
        void chrome.runtime.sendMessage({
          type: "THREAD_CHANGED",
          threadId,
        });
      }
    }

    function checkActiveThread() {
      const activeId = getThreadIdFromLocationAndDom();
      notifyThreadChange(activeId);
      injectButton();
    }

    function debouncedCheck() {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(checkActiveThread, 150);
    }

    function injectButton() {
      const activeId = getThreadIdFromLocationAndDom();
      if (!activeId) {
        const existing = document.getElementById(BUTTON_ID);
        if (existing) {
          existing.remove();
        }
        return;
      }

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
        const threadId = getThreadIdFromLocationAndDom();
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
          await chrome.runtime.sendMessage({
            type: "OPEN_SIDE_PANEL",
            threadId,
          });
        }
      });

      toolbar.appendChild(button);
    }

    // SPA navigation listeners
    window.addEventListener("hashchange", debouncedCheck);
    window.addEventListener("popstate", debouncedCheck);

    // Patch history API for SPA navigation
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      debouncedCheck();
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      debouncedCheck();
    };

    // DOM mutation listener for dynamic rendering changes
    const observer = new MutationObserver(debouncedCheck);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    checkActiveThread();
  },
});

