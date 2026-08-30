import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.workkerz.admin",
  appName: "Workkerz Admin",
  webDir: "public",

  server: {
    url: "http://10.241.81.168:3000/admin",
    cleartext: true,
  },

  android: {
    allowMixedContent: true,
  },
};

export default config;
