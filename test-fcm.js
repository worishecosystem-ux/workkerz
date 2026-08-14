const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = require("./.firebase/firebase-service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});

const token =
  "ehNiFChWQFefVRpOYCz_Ep:APA91bHkjmpkHDbl4gzlowPXHk5hxlDRE6Odz0VKuF0ZWskdPi36gjCI-FwJYtI7Qr9ktyv2Z9eBpgm_5NORauSRG4PP_xUyiETIQRseakt4SfxNBCZF3gw";

const message = {
  token,
  notification: {
    title: "Workkerz Test",
    body: "FCM notification successfully received.",
  },
  data: {
    type: "test",
    action_url: "/notifications",
  },
  android: {
    priority: "high",
    notification: {
      channelId: "workkerz",
    },
  },
};

getMessaging()
  .send(message)
  .then((response) => {
    console.log("FCM SENT SUCCESSFULLY:", response);
  })
  .catch((error) => {
    console.error("FCM SEND ERROR:", error);
    process.exitCode = 1;
  });
