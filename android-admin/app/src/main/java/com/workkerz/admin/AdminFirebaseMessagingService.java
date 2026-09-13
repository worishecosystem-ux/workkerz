package com.workkerz.admin;

import android.content.Intent;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class AdminFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "WORKKERZ_ADMIN_FCM";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();

        Log.d(TAG, "FCM DATA RECEIVED: " + data);

        if (data == null || data.isEmpty()) {
            Log.d(TAG, "No FCM data payload.");
            return;
        }

        String type = data.get("type");

        if (type == null) {
            type = data.get("notification_type");
        }

        if (type == null) {
            type = data.get("event_type");
        }

        if (type == null) {
            Log.d(TAG, "FCM type missing.");
            return;
        }

        if (
                type.equalsIgnoreCase("NEW_ORDER") ||
                type.equalsIgnoreCase("NEW_EAURIX_ORDER") ||
                type.equalsIgnoreCase("ORDER") ||
                type.equalsIgnoreCase("NEW_BOOKING") ||
                type.equalsIgnoreCase("NEW_WORKER_REQUEST")
        ) {

            Intent intent = new Intent(this, OrderAlertService.class);

            for (Map.Entry<String, String> entry : data.entrySet()) {
                intent.putExtra(entry.getKey(), entry.getValue());
            }

            intent.putExtra("alert_type", type);

            try {
                startForegroundService(intent);
                Log.d(TAG, "OrderAlertService started.");
            } catch (Exception e) {
                Log.e(TAG, "Failed to start OrderAlertService", e);
            }
        }
    }

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);

        Log.d(TAG, "NEW ADMIN FCM TOKEN: " + token);

        // Existing Web/Capacitor token registration remains untouched.
        // Native token syncing can be connected later if required.
    }
}
