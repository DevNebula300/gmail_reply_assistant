import { defineBackground } from "wxt/sandbox";

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  });

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (message?.type === "OPEN_SIDE_PANEL" && sender.tab?.id) {
      if (message.threadId) {
        chrome.storage.session.set({ activeThreadId: message.threadId });
      }
      void chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete" || !tab.url?.includes("mail.google.com")) {
      return;
    }

    await chrome.sidePanel.setOptions({
      tabId,
      path: "sidepanel.html",
      enabled: true,
    });
  });
});
