import { Capacitor } from "@capacitor/core";
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";
import { supabase } from "@/lib/supabase";

let initialized = false;

export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  if (initialized) return;
  initialized = true;

  if (Capacitor.isPluginAvailable("LocalNotifications")) {
    await LocalNotifications.requestPermissions();
  }

  const permission = await PushNotifications.requestPermissions();

  if (permission.receive !== "granted") {
    console.log("❌ Notification permission denied");
    return;
  }

  await PushNotifications.removeAllListeners();

  PushNotifications.addListener(
    "registration",
    async (token: Token) => {
      console.log("==================================");
      console.log("✅ FCM TOKEN:", token.value);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("SESSION:", session);
      console.log("SESSION ERROR:", sessionError);

      if (!session?.user) {
        console.log("❌ User not logged in");
        return;
      }

      const payload = {
        user_id: session.user.id,
        email: session.user.email,
        fcm_token: token.value,
        platform: "android",
        updated_at: new Date().toISOString(),
      };

      console.log("PAYLOAD:", payload);

      // Check existing token
      const { data: existing } = await supabase
        .from("device_tokens")
        .select("id")
        .eq("email", session.user.email)
        .maybeSingle();

      let result;

      if (existing) {
        result = await supabase
          .from("device_tokens")
          .update({
            user_id: session.user.id,
            fcm_token: token.value,
            platform: "android",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select();
      } else {
        result = await supabase
          .from("device_tokens")
          .insert(payload)
          .select();
      }

      console.log("UPSERT RESULT:", result);

      if (result.error) {
        console.error("❌ SAVE ERROR:", result.error);
      } else {
        console.log("✅ TOKEN SAVED SUCCESSFULLY");
      }

      console.log("==================================");
    }
  );

  PushNotifications.addListener(
    "registrationError",
    (error) => {
      console.error("❌ Registration Error:", error);
    }
  );

  PushNotifications.addListener(
    "pushNotificationReceived",
    async (notification: PushNotificationSchema) => {
      console.log("📩 PUSH RECEIVED:", notification);

      if (Capacitor.isPluginAvailable("LocalNotifications")) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title:
                notification.data?.title ??
                notification.title ??
                "Workkerz",
              body:
                notification.data?.body ??
                notification.body ??
                "",
              smallIcon: "ic_stat_workkerz",
              iconColor: "#4F46E5",
              channelId: "workkerz",
            },
          ],
        });
      }
    }
  );

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification: ActionPerformed) => {
      console.log("🔔 Notification Click:", notification);
    }
  );

  console.log("🚀 Registering FCM...");
  await PushNotifications.register();
}