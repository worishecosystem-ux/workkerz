package com.workkerz.admin;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.Gravity;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class FullScreenAlertActivity extends Activity {

    private static final String TAG = "FullScreenAlert";

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;

    private String type = "";
    private String title = "";
    private String body = "";

    private String bookingId = "";
    private String orderId = "";
    private String workerRequestId = "";
    private String notificationId = "";

    private boolean closed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        android.util.Log.e(
                TAG,
                "FULLSCREEN ACTIVITY CREATED"
        );

        prepareWindow();
        readIntent();
        showAlert();
        startAlertSound();
        startVibration();
    }

    private void prepareWindow() {

        Window window = getWindow();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            window.addFlags(
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                            | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            );
        }

        window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.setStatusBarColor(0xFF111111);
            window.setNavigationBarColor(0xFF111111);
        }
    }

    private void readIntent() {

        Intent intent = getIntent();

        type = safe(intent.getStringExtra("notification_type"));
        title = safe(intent.getStringExtra("title"));
        body = safe(intent.getStringExtra("body"));

        bookingId = safe(intent.getStringExtra("booking_id"));
        orderId = safe(intent.getStringExtra("order_id"));
        workerRequestId =
                safe(intent.getStringExtra("worker_request_id"));
        notificationId =
                safe(intent.getStringExtra("notification_id"));

        android.util.Log.e(
                TAG,
                "TYPE=" + type
                        + " booking=" + bookingId
                        + " order=" + orderId
                        + " worker=" + workerRequestId
        );
    }

    private void showAlert() {

        LinearLayout root = new LinearLayout(this);

        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(32, 40, 32, 40);
        root.setBackgroundColor(0xFF111111);

        TextView badge = new TextView(this);

        badge.setText(
                type.equals("order")
                        ? "NEW ORDER"
                        : type.equals("worker_request")
                        ? "NEW WORKER REQUEST"
                        : "NEW BOOKING"
        );

        badge.setTextColor(0xFFFFFFFF);
        badge.setTextSize(14);
        badge.setGravity(Gravity.CENTER);

        TextView titleView = new TextView(this);

        titleView.setText(
                title.isEmpty()
                        ? "New Workkerz Alert"
                        : title
        );

        titleView.setTextColor(0xFFFFFFFF);
        titleView.setTextSize(26);
        titleView.setGravity(Gravity.CENTER);
        titleView.setPadding(0, 25, 0, 20);

        TextView bodyView = new TextView(this);

        bodyView.setText(
                body.isEmpty()
                        ? "New request received. Tap Accept or Reject."
                        : body
        );

        bodyView.setTextColor(0xFFE5E5E5);
        bodyView.setTextSize(17);
        bodyView.setGravity(Gravity.CENTER);
        bodyView.setPadding(10, 0, 10, 35);

        Button acceptButton = new Button(this);

        acceptButton.setText("ACCEPT");
        acceptButton.setTextSize(17);
        acceptButton.setAllCaps(false);

        Button rejectButton = new Button(this);

        rejectButton.setText("REJECT");
        rejectButton.setTextSize(17);
        rejectButton.setAllCaps(false);

        LinearLayout.LayoutParams buttonParams =
                new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );

        buttonParams.setMargins(0, 10, 0, 10);

        root.addView(badge);
        root.addView(titleView);
        root.addView(bodyView);

        root.addView(
                acceptButton,
                buttonParams
        );

        root.addView(
                rejectButton,
                buttonParams
        );

        setContentView(root);

        acceptButton.setOnClickListener(
                v -> finishAlert("WORKKERZ_ACCEPT")
        );

        rejectButton.setOnClickListener(
                v -> finishAlert("WORKKERZ_REJECT")
        );
    }

    private void startAlertSound() {

        try {

            stopAlertSound();

            int resourceId = getSoundResource();

            mediaPlayer =
                    MediaPlayer.create(
                            this,
                            resourceId
                    );

            if (mediaPlayer == null) {
                android.util.Log.e(
                        TAG,
                        "MEDIA PLAYER CREATE FAILED"
                );
                return;
            }

            mediaPlayer.setLooping(true);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {

                AudioAttributes attributes =
                        new AudioAttributes.Builder()
                                .setUsage(
                                        AudioAttributes.USAGE_ALARM
                                )
                                .setContentType(
                                        AudioAttributes.CONTENT_TYPE_SONIFICATION
                                )
                                .build();

                mediaPlayer.setAudioAttributes(
                        attributes
                );
            }

            mediaPlayer.setVolume(1.0f, 1.0f);

            mediaPlayer.start();

            android.util.Log.e(
                    TAG,
                    "ALERT SOUND STARTED type=" + type
            );

        } catch (Exception e) {

            android.util.Log.e(
                    TAG,
                    "ALERT SOUND ERROR",
                    e
            );
        }
    }

    private int getSoundResource() {

        try {

            if ("order".equals(type)) {
                int id =
                        getResources().getIdentifier(
                                "order",
                                "raw",
                                getPackageName()
                        );

                if (id != 0) {
                    return id;
                }
            }

            if ("worker_request".equals(type)) {
                int id =
                        getResources().getIdentifier(
                                "worker_request",
                                "raw",
                                getPackageName()
                        );

                if (id != 0) {
                    return id;
                }
            }

            int bookingId =
                    getResources().getIdentifier(
                            "booking",
                            "raw",
                            getPackageName()
                    );

            if (bookingId != 0) {
                return bookingId;
            }

        } catch (Exception e) {

            android.util.Log.e(
                    TAG,
                    "SOUND RESOURCE ERROR",
                    e
            );
        }

        return 0;
    }

    private void startVibration() {

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

                VibratorManager manager =
                        (VibratorManager)
                                getSystemService(
                                        VIBRATOR_MANAGER_SERVICE
                                );

                if (manager != null) {
                    vibrator = manager.getDefaultVibrator();
                }

            } else {

                vibrator =
                        (Vibrator)
                                getSystemService(
                                        VIBRATOR_SERVICE
                                );
            }

            if (vibrator == null) {
                return;
            }

            long[] pattern;

            if ("order".equals(type)) {

                pattern = new long[]{
                        0,
                        350,
                        180,
                        250,
                        180,
                        500
                };

            } else if ("worker_request".equals(type)) {

                pattern = new long[]{
                        0,
                        200,
                        120,
                        350,
                        120,
                        200
                };

            } else {

                pattern = new long[]{
                        0,
                        250,
                        150,
                        350,
                        150,
                        550
                };
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                vibrator.vibrate(
                        VibrationEffect.createWaveform(
                                pattern,
                                0
                        )
                );

            } else {

                vibrator.vibrate(
                        pattern,
                        0
                );
            }

            android.util.Log.e(
                    TAG,
                    "ALERT VIBRATION STARTED"
            );

        } catch (Exception e) {

            android.util.Log.e(
                    TAG,
                    "VIBRATION ERROR",
                    e
            );
        }
    }

    private void stopAlertSound() {

        try {

            if (mediaPlayer != null) {

                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }

                mediaPlayer.release();
                mediaPlayer = null;
            }

        } catch (Exception ignored) {
        }
    }

    private void stopVibration() {

        try {

            if (vibrator != null) {
                vibrator.cancel();
            }

        } catch (Exception ignored) {
        }
    }

    private void finishAlert(String action) {

        if (closed) {
            return;
        }

        closed = true;

        android.util.Log.e(
                TAG,
                "ALERT ACTION=" + action
        );

        stopAlertSound();
        stopVibration();

        Intent receiverIntent =
                new Intent(
                        this,
                        BookingActionReceiver.class
                );

        receiverIntent.setAction(action);

        receiverIntent.putExtra(
                "notification_type",
                type
        );

        receiverIntent.putExtra(
                "booking_id",
                bookingId
        );

        receiverIntent.putExtra(
                "order_id",
                orderId
        );

        receiverIntent.putExtra(
                "worker_request_id",
                workerRequestId
        );

        receiverIntent.putExtra(
                "notification_id",
                notificationId
        );

        sendBroadcast(receiverIntent);

        cancelNotification();

        finishAndRemoveTask();
    }

    private void cancelNotification() {

        try {

            android.app.NotificationManager manager =
                    (android.app.NotificationManager)
                            getSystemService(
                                    Context.NOTIFICATION_SERVICE
                            );

            if (manager != null) {

                int id = getNotificationId();

                manager.cancel(id);

                android.util.Log.e(
                        TAG,
                        "NOTIFICATION CANCELLED id=" + id
                );
            }

        } catch (Exception e) {

            android.util.Log.e(
                    TAG,
                    "NOTIFICATION CANCEL ERROR",
                    e
            );
        }
    }

    private int getNotificationId() {

        String value;

        if (!bookingId.isEmpty()) {
            value = "booking_" + bookingId;
        } else if (!workerRequestId.isEmpty()) {
            value = "worker_request_" + workerRequestId;
        } else if (!orderId.isEmpty()) {
            value = "order_" + orderId;
        } else {
            value = "notification_" + notificationId;
        }

        return Math.abs(value.hashCode());
    }

    @Override
    protected void onNewIntent(Intent intent) {

        super.onNewIntent(intent);

        setIntent(intent);

        stopAlertSound();
        stopVibration();

        readIntent();
        showAlert();
        startAlertSound();
        startVibration();
    }

    @Override
    protected void onDestroy() {

        stopAlertSound();
        stopVibration();

        super.onDestroy();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
