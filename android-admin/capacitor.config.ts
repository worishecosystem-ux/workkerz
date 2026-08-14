import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.workkerz.admin",
  appName: "Workkerz Admin",
  webDir: "www",

  server: {
    url: "https://workkerz.com/admin",
    cleartext: false,
  },

  android: {
    appendUserAgent: " WorkkerzAdmin",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "admin_splash",
      showSpinner: false,
    },

    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
