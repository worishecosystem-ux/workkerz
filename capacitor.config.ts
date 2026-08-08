import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL || "https://workkerz.com";

const isLocal = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "com.workkerz.app",
  appName: "Workkerz",
  webDir: "public",

  server: {
    url: serverUrl,
    cleartext: isLocal,
  },

  android: {
    appendUserAgent: " WorkkerzApp",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },

    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
  },
};

export default config;