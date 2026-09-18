package com.workkerz.admin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class WorkkerzFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "WorkkerzFCM";
    private static final String CHANNEL_ID = "workkerz_bookings";
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
        Log.e(TAG, "Has Notification = " + (remoteMessage.getNotification() != null));

        if (remoteMessage.getNotification() != null) {
            Log.e(TAG, "Notification Title = " +
                    remoteMessage.getNotification().getTitle());
            Log.e(TAG, "Notification Body = " +
                    remoteMessage.getNotification().getBody());
        }

        Map<String, String> data = remoteMessage.getData();

        String title = value(data, "title", "New Booking Received");
        String body = value(data, "body", "A new booking has been received.");

        String customer = value(data, "customer_name", "Customer");
        String service = value(data, "service", "Service");
        String orderId = value(data, "order_id_display", "Workkerz Booking");
        String amount = value(data, "amount", "0");
        String status = value(data, "status", "pending");
        String location = value(data, "location", "Location unavailable");
        String bookingTime = value(data, "booking_time", "Time not specified");
        String workDate = value(data, "work_date", "Date not specified");
        String bookingId = value(data, "booking_id", "");

        createChannel();

        Intent fullScreenIntent =
                new Intent(this, FullScreenAlertActivity.class);

        fullScreenIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        fullScreenIntent.putExtra("notification_type", "booking");
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
                new NotificationCompat.Builder(this, CHANNEL_ID)
                        .setSmallIcon(android.R.drawable.ic_dialog_info)
                        .setContentTitle(title)
                        .setContentText(body)
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .bigText(body)
                        )
                        .setPriority(NotificationCompat.PRIORITY_MAX)
                        .setCategory(NotificationCompat.CATEGORY_CALL)
                        .setAutoCancel(true)
                        .setOngoing(false)
                        .setFullScreenIntent(fullScreenPendingIntent, true);

        NotificationManagerCompat.from(this)
                .notify(NOTIFICATION_ID, builder.build());

        Log.e(TAG, "===== WORKKERZ NOTIFICATION DISPLAYED =====");
        Log.e(TAG, "Booking ID = " + bookingId);
    }

    private String value(
            Map<String, String> data,
            String key,
            String fallback
    ) {
        String value = data.get(key);

        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }

        return value;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager =
                    getSystemService(NotificationManager.class);

            NotificationChannel channel =
                    new NotificationChannel(
                            CHANNEL_ID,
                            "Workkerz Bookings",
                            NotificationManager.IMPORTANCE_HIGH
                    );

            channel.setDescription(
                    "New Workkerz booking alerts"
            );

            channel.setLockscreenVisibility(
                    android.app.Notification.VISIBILITY_PUBLIC
            );

            manager.createNotificationChannel(channel);
        }
    }
}
