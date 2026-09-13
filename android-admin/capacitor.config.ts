import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.workkerz.admin",
  appName: "Workkerz Admin",
  webDir: "public",

  server: {
    url: "https://workkerz.com/admin",
    cleartext: true,,
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;
