package com.workkerz.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class WorkkerzFirebaseMessagingService
        extends FirebaseMessagingService {

    private static final String TAG = "WorkkerzFCM";
    private static final String CHANNEL_ID = "default";
    private static final String CHANNEL_NAME = "Workkerz Notifications";

    @Override
    public void onMessageReceived(
            @NonNull RemoteMessage remoteMessage
    ) {
        Log.d(TAG, "FCM message received");

        Map<String, String> data =
                remoteMessage.getData();

        if (data == null || data.isEmpty()) {
            Log.d(TAG, "FCM data is empty");
            return;
        }

        String title = data.get("title");
        String body = data.get("body");
        String actionUrl = data.get("action_url");
        String imageUrl = data.get("image_url");
        String notificationId = data.get("notification_id");
        String bookingId = data.get("booking_id");

        if (title == null || title.trim().isEmpty()) {
            title = "Workkerz";
        }

        if (body == null || body.trim().isEmpty()) {
            body = "You have a new notification.";
        }

        createNotificationChannel();

        showNotification(
                title,
                body,
                actionUrl,
                imageUrl,
                notificationId,
                bookingId
        );
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);

        Log.d(TAG, "New FCM token: " + token);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager =
                getSystemService(NotificationManager.class);

        if (manager == null) {
            return;
        }

        NotificationChannel existing =
                manager.getNotificationChannel(CHANNEL_ID);

        if (existing != null) {
            return;
        }

        NotificationChannel channel =
                new NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                );

        channel.setDescription(
                "Workkerz Push Notifications"
        );

        channel.enableLights(true);
        channel.enableVibration(true);

        channel.setVibrationPattern(
                new long[]{0, 300, 200, 300}
        );

        manager.createNotificationChannel(channel);
    }

    private void showNotification(
            String title,
            String body,
            String actionUrl,
            String imageUrl,
            String notificationId,
            String bookingId
    ) {
        Intent intent;

        if (actionUrl != null &&
                !actionUrl.trim().isEmpty()) {

            try {
                Uri uri = Uri.parse(actionUrl);

                intent = new Intent(
                        Intent.ACTION_VIEW,
                        uri
                );

                intent.setPackage(getPackageName());

            } catch (Exception error) {
                Log.e(
                        TAG,
                        "Invalid action URL",
                        error
                );

                intent = new Intent(
                        this,
                        MainActivity.class
                );
            }

        } else {
            intent = new Intent(
                    this,
                    MainActivity.class
            );
        }

        intent.addFlags(
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        if (bookingId != null &&
                !bookingId.trim().isEmpty()) {

            intent.putExtra(
                    "booking_id",
                    bookingId
            );
        }

        PendingIntent pendingIntent =
                PendingIntent.getActivity(
                        this,
                        createRequestCode(notificationId),
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                        PendingIntent.FLAG_IMMUTABLE
                );

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(
                        this,
                        CHANNEL_ID
                )
                .setSmallIcon(
                        getApplicationInfo().icon
                )
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(
                        new NotificationCompat.BigTextStyle()
                                .bigText(body)
                )
                .setPriority(
                        NotificationCompat.PRIORITY_HIGH
                )
                .setCategory(
                        NotificationCompat.CATEGORY_MESSAGE
                )
                .setAutoCancel(true)
                .setShowWhen(true)
                .setContentIntent(pendingIntent)
                .setVibrate(
                        new long[]{0, 300, 200, 300}
                );

        if (imageUrl != null &&
                !imageUrl.trim().isEmpty()) {

            Bitmap bitmap =
                    downloadImage(imageUrl);

            if (bitmap != null) {

                builder.setLargeIcon(bitmap);

                builder.setStyle(
                        new NotificationCompat
                                .BigPictureStyle()
                                .bigPicture(bitmap)
                                .setBigContentTitle(title)
                                .setSummaryText(body)
                );
            }
        }

        NotificationManagerCompat manager =
                NotificationManagerCompat.from(this);

        try {
            manager.notify(
                    createRequestCode(notificationId),
                    builder.build()
            );

            Log.d(
                    TAG,
                    "Notification displayed"
            );

        } catch (SecurityException error) {
            Log.e(
                    TAG,
                    "Notification permission denied",
                    error
            );
        }
    }

    private int createRequestCode(String value) {
        if (value == null ||
                value.trim().isEmpty()) {

            return (int) System.currentTimeMillis();
        }

        return Math.abs(value.hashCode());
    }

    private Bitmap downloadImage(String imageUrl) {
        HttpURLConnection connection = null;

        try {
            URL url = new URL(imageUrl);

            connection =
                    (HttpURLConnection)
                            url.openConnection();

            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setDoInput(true);
            connection.connect();

            if (connection.getResponseCode() !=
                    HttpURLConnection.HTTP_OK) {

                return null;
            }

            InputStream inputStream =
                    connection.getInputStream();

            Bitmap bitmap =
                    BitmapFactory.decodeStream(
                            inputStream
                    );

            inputStream.close();

            return bitmap;

        } catch (Exception error) {

            Log.e(
                    TAG,
                    "Unable to download notification image",
                    error
            );

            return null;

        } finally {

            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
