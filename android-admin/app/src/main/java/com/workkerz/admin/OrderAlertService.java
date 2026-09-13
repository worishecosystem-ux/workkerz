package com.workkerz.admin;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class OrderAlertService extends Service {

    private static final String TAG = "WORKKERZ_ORDER_ALERT";
    private static final String CHANNEL_ID = "workkerz_order_alert";
    private static final int NOTIFICATION_ID = 9001;

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;

    @Override
    public void onCreate() {
        super.onCreate();

        createNotificationChannel();

        startForeground(
                NOTIFICATION_ID,
                buildForegroundNotification()
        );

        startRingtone();
        startVibration();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        if (intent != null) {

            String type = intent.getStringExtra("alert_type");

            Log.d(TAG, "Order alert received: " + type);

            Intent alertIntent = new Intent(
                    this,
                    OrderAlertActivity.class
            );

            if (intent.getExtras() != null) {
                alertIntent.putExtras(intent.getExtras());
            }

            alertIntent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK |
                    Intent.FLAG_ACTIVITY_SINGLE_TOP |
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
            );

            try {
                startActivity(alertIntent);
                Log.d(TAG, "OrderAlertActivity opened.");
            } catch (Exception e) {
                Log.e(TAG, "Unable to open OrderAlertActivity", e);
            }
        }

        return START_STICKY;
    }

    private void startRingtone() {

        try {

            stopRingtone();

            mediaPlayer = MediaPlayer.create(
                    this,
                    Settings.System.DEFAULT_NOTIFICATION_URI
            );

            if (mediaPlayer == null) {
                Log.e(TAG, "MediaPlayer could not be created.");
                return;
            }

            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(
                                    AudioAttributes.CONTENT_TYPE_SONIFICATION
                            )
                            .build()
            );

            mediaPlayer.setLooping(true);
            mediaPlayer.start();

            Log.d(TAG, "Order ringtone started.");

        } catch (Exception e) {
            Log.e(TAG, "Ringtone error", e);
        }
    }

    private void startVibration() {

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

                VibratorManager manager =
                        (VibratorManager) getSystemService(
                                VIBRATOR_MANAGER_SERVICE
                        );

                if (manager != null) {
                    vibrator = manager.getDefaultVibrator();
                }

            } else {

                vibrator =
                        (Vibrator) getSystemService(VIBRATOR_SERVICE);
            }

            if (vibrator == null || !vibrator.hasVibrator()) {
                Log.d(TAG, "Vibrator unavailable.");
                return;
            }

            long[] pattern = {
                    0,
                    700,
                    300,
                    700,
                    300
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                vibrator.vibrate(
                        VibrationEffect.createWaveform(
                                pattern,
                                0
                        )
                );

            } else {

                vibrator.vibrate(pattern, 0);
            }

            Log.d(TAG, "Order vibration started.");

        } catch (Exception e) {
            Log.e(TAG, "Vibration error", e);
        }
    }

    private void stopRingtone() {

        try {

            if (mediaPlayer != null) {

                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }

                mediaPlayer.reset();
                mediaPlayer.release();
                mediaPlayer = null;
            }

        } catch (Exception e) {
            Log.e(TAG, "Ringtone stop error", e);
            mediaPlayer = null;
        }
    }

    private void stopVibration() {

        try {

            if (vibrator != null) {
                vibrator.cancel();
            }

        } catch (Exception e) {
            Log.e(TAG, "Vibration stop error", e);
        }
    }

    public void stopAlert() {

        stopRingtone();
        stopVibration();

        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();

        Log.d(TAG, "Order alert stopped.");
    }

    private Notification buildForegroundNotification() {

        Intent intent = new Intent(
                this,
                OrderAlertActivity.class
        );

        PendingIntent pendingIntent =
                PendingIntent.getActivity(
                        this,
                        NOTIFICATION_ID,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT |
                        PendingIntent.FLAG_IMMUTABLE
                );

        return new NotificationCompat.Builder(
                this,
                CHANNEL_ID
        )
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("New Workkerz Order")
                .setContentText("Waiting for your action")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setOngoing(true)
                .setAutoCancel(false)
                .setContentIntent(pendingIntent)
                .build();
    }

    private void createNotificationChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel =
                    new NotificationChannel(
                            CHANNEL_ID,
                            "Workkerz Order Alerts",
                            NotificationManager.IMPORTANCE_HIGH
                    );

            channel.setDescription(
                    "Urgent Workkerz Admin order alerts"
            );

            channel.enableVibration(true);

            NotificationManager manager =
                    getSystemService(
                            NotificationManager.class
                    );

            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {

        stopRingtone();
        stopVibration();

        Log.d(TAG, "OrderAlertService destroyed.");

        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
