import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.workkerz.app",
  appName: "Workkerz",
  webDir: "public",
  appendUserAgent: " WorkkerzApp",
  server: {
    url: "https://workkerz.com",

    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
