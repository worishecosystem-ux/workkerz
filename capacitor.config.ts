import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.workkerz.app",
  appName: "Workkerz",
  webDir: "public",

  server: {
    url: "https://workkerz.com",
    cleartext: false,
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;
