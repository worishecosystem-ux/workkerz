import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getFirebaseApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is missing");
  }

  if (!clientEmail) {
    throw new Error("FIREBASE_CLIENT_EMAIL is missing");
  }

  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is missing");
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export function getFirebaseMessaging() {
  return getMessaging(getFirebaseApp());
}
