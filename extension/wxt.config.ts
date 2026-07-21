import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Gmail Reply Assistant",
    description: "AI-powered contextual reply suggestions for Gmail",
    permissions: ["storage", "sidePanel", "activeTab"],
    host_permissions: [
      "https://mail.google.com/*",
      "http://localhost:8000/*",
    ],
  },
  runner: {
    disabled: true,
  },
});
