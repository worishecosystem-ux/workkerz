import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.workkerz.app",
  appName: "Workkerz",
  webDir: "public",

  server: {
    url: "http://10.241.81.168:3000",
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;
