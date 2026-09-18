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

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.workkerz.admin.BookingActionReceiver;
import com.workkerz.admin.FullScreenAlertActivity;
import com.workkerz.admin.R;

import java.util.Map;

public class WorkkerzFirebaseMessagingService
        extends FirebaseMessagingService {

    private static final String TAG = "WorkkerzFCM";

    private static final String CHANNEL_ID =
            "workkerz_admin_booking_v5";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {

        Log.e(TAG, "====================================");
        Log.e(TAG, "FCM MESSAGE RECEIVED");
        Log.e(TAG, "Data = " + remoteMessage.getData());

        Map<String, String> data = remoteMessage.getData();

        String type = getValue(
                data,
                "type",
                "booking"
        ).trim().toLowerCase();

        String title = getValue(
                data,
                "title",
                "New Booking"
        );

        String body = getValue(
                data,
                "body",
                "New booking received"
        );

        String customer = getValue(
                data,
                "customer_name",
                getValue(data, "customer", "Customer")
        );

        String service = getValue(
                data,
                "service",
                "Service"
        );

        String location = getValue(
                data,
                "location",
                "Location not available"
        );

        String bookingTime = getValue(
                data,
                "booking_time",
                getValue(data, "time", "Time not specified")
        );

        String amount = getValue(
                data,
                "amount",
                "₹0"
        );

        String bookingId = getValue(
                data,
                "booking_id",
                ""
        );

        String orderId = getValue(
                data,
                "order_id",
                ""
        );

        String workerRequestId = getValue(
                data,
                "worker_request_id",
                getValue(data, "workerRequestId", "")
        );

        String notificationId = getValue(
                data,
                "notification_id",
                ""
        );

        Log.e(TAG, "TYPE = " + type);
        Log.e(TAG, "TITLE = " + title);
        Log.e(TAG, "BOOKING ID = " + bookingId);
        Log.e(TAG, "ORDER ID = " + orderId);
        Log.e(TAG, "WORKER REQUEST ID = " + workerRequestId);

        createNotificationChannel();

        /*
         * =========================================================
         * FULL SCREEN ALERT ACTIVITY
         * =========================================================
         */

        Intent alertIntent = new Intent(
                this,
                FullScreenAlertActivity.class
        );

        alertIntent.putExtra(
                "notification_type",
                type
        );

        alertIntent.putExtra(
                "title",
                title
        );

        alertIntent.putExtra(
                "body",
                body
        );

        alertIntent.putExtra(
                "customer_name",
                customer
        );

        alertIntent.putExtra(
                "service",
                service
        );

        alertIntent.putExtra(
                "location",
                location
        );

        alertIntent.putExtra(
                "booking_time",
                bookingTime
        );

        alertIntent.putExtra(
                "amount",
                amount
        );

        alertIntent.putExtra(
                "booking_id",
                bookingId
        );

        alertIntent.putExtra(
                "order_id",
                orderId
        );

        alertIntent.putExtra(
                "worker_request_id",
                workerRequestId
        );

        alertIntent.putExtra(
                "notification_id",
                notificationId
        );

        alertIntent.putExtra(
                "notification_action",
                "open"
        );

        alertIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        int notificationIdInt = getStableId(
                notificationId,
                bookingId,
                orderId,
                workerRequestId
        );

        PendingIntent fullScreenPendingIntent =
                PendingIntent.getActivity(
                        this,
                        notificationIdInt,
                        alertIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT
                                | PendingIntent.FLAG_IMMUTABLE
                );

        // IMPORTANT: Launch fullscreen alert immediately for every booking.
        // This is intentionally independent of the notification tap action.
        if ("booking".equalsIgnoreCase(type)) {
            try {
                alertIntent.addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK
                                | Intent.FLAG_ACTIVITY_CLEAR_TOP
                                | Intent.FLAG_ACTIVITY_SINGLE_TOP
                                | Intent.FLAG_ACTIVITY_NO_USER_ACTION
                );

                startActivity(alertIntent);

                Log.e(
                        TAG,
                        "FULLSCREEN ALERT STARTED booking_id=" + bookingId
                );
            } catch (Exception e) {
                Log.e(
                        TAG,
                        "FULLSCREEN ALERT START FAILED",
                        e
                );
            }
        }

        /*
         * =========================================================
         * NORMAL OPEN APP INTENT
         * =========================================================
         */

        Intent openIntent = new Intent(
                this,
                MainActivity.class
        );

        openIntent.putExtra(
                "notification_type",
                type
        );

        openIntent.putExtra(
                "booking_id",
                bookingId
        );

        openIntent.putExtra(
                "order_id",
                orderId
        );

        openIntent.putExtra(
                "worker_request_id",
                workerRequestId
        );

        openIntent.putExtra(
                "notification_id",
                notificationId
        );

        openIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent openPendingIntent =
                PendingIntent.getActivity(
                        this,
                        notificationIdInt + 50000,
                        openIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT
                                | PendingIntent.FLAG_IMMUTABLE
                );

        /*
         * =========================================================
         * NOTIFICATION
         * =========================================================
         */

        Uri soundUri = Uri.parse(
                "android.resource://"
                        + getPackageName()
                        + "/raw/booking"
        );

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(
                        this,
                        CHANNEL_ID
                )
                        .setSmallIcon(
                                com.workkerz.admin.R.drawable.ic_notification
                        )
                        .setContentTitle(title)
                        .setContentText(body)
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .bigText(
                                                body
                                                        + "\n"
                                                        + customer
                                                        + " • "
                                                        + service
                                                        + "\n"
                                                        + amount
                                        )
                        )
                        .setPriority(
                                NotificationCompat.PRIORITY_MAX
                        )
                        .setCategory(
                                NotificationCompat.CATEGORY_CALL
                        )
                        .setVisibility(
                                NotificationCompat.VISIBILITY_PUBLIC
                        )
                        .setAutoCancel(true)
                        .setOngoing(false)
                        .setContentIntent(
                                openPendingIntent
                        )
                        .setFullScreenIntent(
                                fullScreenPendingIntent,
                                true
                        )
                        .setWhen(
                                System.currentTimeMillis()
                        )
                        .setShowWhen(true);

        /*
         * Sound is controlled by the notification channel.
         * Do not set notification sound separately on Android O+.
         */

        NotificationManager notificationManager =
                (NotificationManager)
                        getSystemService(
                                NOTIFICATION_SERVICE
                        );

        if (notificationManager != null) {

            notificationManager.notify(
                    notificationIdInt,
                    builder.build()
            );

            Log.e(
                    TAG,
                    "NOTIFICATION POSTED id="
                            + notificationIdInt
            );
        } else {

            Log.e(
                    TAG,
                    "NOTIFICATION MANAGER NULL"
            );
        }
    }

    private void createNotificationChannel() {

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager notificationManager =
                getSystemService(
                        NotificationManager.class
                );

        if (notificationManager == null) {
            return;
        }

        NotificationChannel existing =
                notificationManager.getNotificationChannel(
                        CHANNEL_ID
                );

        if (existing != null) {
            return;
        }

        NotificationChannel channel =
                new NotificationChannel(
                        CHANNEL_ID,
                        "Workkerz Admin Booking Alerts",
                        NotificationManager.IMPORTANCE_HIGH
                );

        channel.setDescription(
                "Important Workkerz booking alerts"
        );

        channel.enableVibration(true);

        channel.setVibrationPattern(
                new long[]{
                        0,
                        300,
                        200,
                        300
                }
        );

        channel.enableLights(true);

        channel.setShowBadge(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

            channel.setAllowBubbles(false);
        }

        Uri soundUri = Uri.parse(
                "android.resource://"
                        + getPackageName()
                        + "/raw/booking"
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

        channel.setSound(
                soundUri,
                audioAttributes
        );

        notificationManager.createNotificationChannel(
                channel
        );

        Log.e(
                TAG,
                "CHANNEL CREATED = " + CHANNEL_ID
        );
    }

    private String getValue(
            Map<String, String> data,
            String key,
            String fallback
    ) {

        if (data == null) {
            return fallback;
        }

        String value = data.get(key);

        if (value == null) {
            return fallback;
        }

        value = value.trim();

        if (value.isEmpty()) {
            return fallback;
        }

        return value;
    }

    private int getStableId(
            String notificationId,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        String source;

        if (notificationId != null
                && !notificationId.trim().isEmpty()) {

            source = notificationId;

        } else if (bookingId != null
                && !bookingId.trim().isEmpty()) {

            source = bookingId;

        } else if (orderId != null
                && !orderId.trim().isEmpty()) {

            source = orderId;

        } else if (workerRequestId != null
                && !workerRequestId.trim().isEmpty()) {

            source = workerRequestId;

        } else {

            source =
                    String.valueOf(
                            System.currentTimeMillis()
                    );
        }

        int id = source.hashCode();

        if (id == 0) {
            id = 10001;
        }

        return Math.abs(id);
    }

    @Override
    public void onNewToken(String token) {

        super.onNewToken(token);

        Log.e(
                TAG,
                "FCM TOKEN UPDATED = " + token
        );
    }
}
