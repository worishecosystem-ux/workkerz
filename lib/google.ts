import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";

let initialized = false;

export async function initializeGoogle() {
  if (initialized) return;

  await GoogleSignIn.initialize({
    clientId:
      "982566536975-fgrf6tooif69oi8sgkvo9rgb1vrllapb.apps.googleusercontent.com",
  });

  initialized = true;
}