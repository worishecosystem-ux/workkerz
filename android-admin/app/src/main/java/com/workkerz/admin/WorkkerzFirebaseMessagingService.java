package com.workkerz.admin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class WorkkerzFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "WorkkerzFCM";

    // Normal notification channel - unchanged
    private static final String CHANNEL_NOTIFICATION = "workkerz_bookings";

    // Three screen-alert channels
    private static final String CHANNEL_BOOKING =
            "workkerz_booking_alert_v3";

    private static final String CHANNEL_WORKER_REQUEST =
            "workkerz_worker_request_alert_v3";

    private static final String CHANNEL_ORDER =
            "workkerz_order_alert_v3";

    private static final int NOTIFICATION_ID = 140926;

    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);

        Log.e(TAG, "========================================");
        Log.e(TAG, "NEW FIREBASE TOKEN");
        Log.e(TAG, token);
        Log.e(TAG, "========================================");

        // Send this token to your Workkerz backend/Supabase.
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Log.e(TAG, "========================================");
        Log.e(TAG, "===== WORKKERZ FCM RECEIVED =====");
        Log.e(TAG, "From = " + remoteMessage.getFrom());
        Log.e(TAG, "Message ID = " + remoteMessage.getMessageId());
        Log.e(TAG, "Data = " + remoteMessage.getData());
        Log.e(TAG, "Has Notification = " +
                (remoteMessage.getNotification() != null));

        Map<String, String> data = remoteMessage.getData();

        String title = value(
                data,
                "title",
                "New Booking Received"
        );

        String body = value(
                data,
                "body",
                "A new booking has been received."
        );

        String customer = value(
                data,
                "customer_name",
                "Customer"
        );

        String service = value(
                data,
                "service",
                "Service"
        );

        String orderId = value(
                data,
                "order_id_display",
                "Workkerz Booking"
        );

        String amount = value(
                data,
                "amount",
                "0"
        );

        String status = value(
                data,
                "status",
                "pending"
        );

        String location = value(
                data,
                "location",
                "Location unavailable"
        );

        String bookingTime = value(
                data,
                "booking_time",
                "Time not specified"
        );

        String workDate = value(
                data,
                "work_date",
                "Date not specified"
        );

        String bookingId = value(
                data,
                "booking_id",
                ""
        );

        String alertType = getAlertType(data);

        Log.e(TAG, "Alert Type = " + alertType);

        /*
         * IMPORTANT:
         * Normal notification remains on the existing channel.
         * Only the three screen alerts get custom sounds.
         */
        String channelId;

        if ("worker_request".equals(alertType)) {
            channelId = CHANNEL_WORKER_REQUEST;
        } else if ("order".equals(alertType)) {
            channelId = CHANNEL_ORDER;
        } else if ("notification".equals(alertType)) {
            channelId = CHANNEL_NOTIFICATION;
        } else {
            // Default screen alert = booking
            channelId = CHANNEL_BOOKING;
        }

        createChannels();

        Intent fullScreenIntent =
                new Intent(this, FullScreenAlertActivity.class);

        fullScreenIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        fullScreenIntent.putExtra(
                "notification_type",
                alertType
        );

        fullScreenIntent.putExtra("alert_type", alertType);
        fullScreenIntent.putExtra("title", title);
        fullScreenIntent.putExtra("body", body);
        fullScreenIntent.putExtra("customer_name", customer);
        fullScreenIntent.putExtra("service", service);
        fullScreenIntent.putExtra("order_id_display", orderId);
        fullScreenIntent.putExtra("amount", amount);
        fullScreenIntent.putExtra("status", status);
        fullScreenIntent.putExtra("location", location);
        fullScreenIntent.putExtra("booking_time", bookingTime);
        fullScreenIntent.putExtra("work_date", workDate);
        fullScreenIntent.putExtra("booking_id", bookingId);

        PendingIntent fullScreenPendingIntent =
                PendingIntent.getActivity(
                        this,
                        NOTIFICATION_ID,
                        fullScreenIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                        PendingIntent.FLAG_IMMUTABLE
                );

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(
                        this,
                        channelId
                )
                        .setSmallIcon(
                                android.R.drawable.ic_dialog_info
                        )
                        .setContentTitle(title)
                        .setContentText(body)
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .bigText(body)
                        )
                        .setPriority(
                                NotificationCompat.PRIORITY_MAX
                        )
                        .setCategory(
                                NotificationCompat.CATEGORY_CALL
                        )
                        .setAutoCancel(true)
                        .setOngoing(false)
                        .setFullScreenIntent(
                                fullScreenPendingIntent,
                                true
                        );

        NotificationManagerCompat
                .from(this)
                .notify(
                        NOTIFICATION_ID,
                        builder.build()
                );

        Log.e(TAG, "===== WORKKERZ NOTIFICATION DISPLAYED =====");
        Log.e(TAG, "Channel = " + channelId);
        Log.e(TAG, "Alert Type = " + alertType);
        Log.e(TAG, "Booking ID = " + bookingId);
    }

    private String getAlertType(
            Map<String, String> data
    ) {
        String type = data.get("notification_type");

        if (type == null || type.trim().isEmpty()) {
            type = data.get("alert_type");
        }

        if (type == null || type.trim().isEmpty()) {
            type = data.get("type");
        }

        if (type == null || type.trim().isEmpty()) {
            return "booking";
        }

        type = type.trim().toLowerCase();

        if (type.contains("worker") &&
                type.contains("request")) {
            return "worker_request";
        }

        if (type.contains("order") ||
                type.contains("material")) {
            return "order";
        }

        if (type.contains("notification")) {
            return "notification";
        }

        if (type.contains("booking") ||
                type.contains("book")) {
            return "booking";
        }

        return "booking";
    }

    private String value(
            Map<String, String> data,
            String key,
            String fallback
    ) {
        String value = data.get(key);

        if (value == null ||
                value.trim().isEmpty()) {
            return fallback;
        }

        return value;
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager =
                getSystemService(NotificationManager.class);

        if (manager == null) {
            return;
        }

        // Normal notification - NO CHANGE
        NotificationChannel normal =
                new NotificationChannel(
                        CHANNEL_NOTIFICATION,
                        "Workkerz Bookings",
                        NotificationManager.IMPORTANCE_HIGH
                );

        normal.setDescription(
                "New Workkerz booking alerts"
        );

        normal.setLockscreenVisibility(
                android.app.Notification.VISIBILITY_PUBLIC
        );

        manager.createNotificationChannel(normal);

        // Booking - booking.mp3
        createSoundChannel(
                manager,
                CHANNEL_BOOKING,
                "Workkerz Booking Alerts",
                "New Workkerz booking screen alerts",
                R.raw.booking
        );

        // Worker Request - worker_request.mp3
        createSoundChannel(
                manager,
                CHANNEL_WORKER_REQUEST,
                "Workkerz Worker Requests",
                "Worker request screen alerts",
                R.raw.worker_request
        );

        // Order - order.mp3
        createSoundChannel(
                manager,
                CHANNEL_ORDER,
                "Workkerz Order Alerts",
                "Order screen alerts",
                R.raw.order
        );
    }

    private void createSoundChannel(
            NotificationManager manager,
            String channelId,
            String channelName,
            String description,
            int soundResource
    ) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        Uri soundUri = Uri.parse(
                "android.resource://" +
                getPackageName() +
                "/" +
                soundResource
        );

        AudioAttributes audioAttributes =
                new AudioAttributes.Builder()
                        .setUsage(
                                AudioAttributes.USAGE_NOTIFICATION
                        )
                        .setContentType(
                                AudioAttributes.CONTENT_TYPE_SONIFICATION
                        )
                        .build();

        NotificationChannel channel =
                new NotificationChannel(
                        channelId,
                        channelName,
                        NotificationManager.IMPORTANCE_HIGH
                );

        channel.setDescription(description);

        channel.setSound(
                soundUri,
                audioAttributes
        );

        channel.enableVibration(true);

        channel.setLockscreenVisibility(
                android.app.Notification.VISIBILITY_PUBLIC
        );

        manager.createNotificationChannel(channel);
    }
}
