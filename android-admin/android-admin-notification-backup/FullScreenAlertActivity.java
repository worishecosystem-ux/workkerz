package com.workkerz.admin;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

public class FullScreenAlertActivity extends Activity {

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private CountDownTimer countDownTimer;

    private String type = "";
    private String bookingId = "";
    private String orderId = "";
    private String workerRequestId = "";
    private String notificationId = "";

    private static final long ALERT_DURATION = 30000L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        prepareWindow();

        setContentView(R.layout.activity_full_screen_alert);

        bindIntent(getIntent());

        setupViews();

        startAlert();
    }

    private void prepareWindow() {
        Window window = getWindow();

        window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                        | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(0xFFFFFFFF);
            window.setNavigationBarColor(0xFFFFFFFF);

            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            );
        }
    }

    private void bindIntent(Intent intent) {
        if (intent == null) return;

        type = value(
                intent.getStringExtra("notification_type"),
                intent.getStringExtra("type")
        );

        bookingId = value(
                intent.getStringExtra("booking_id"),
                ""
        );

        orderId = value(
                intent.getStringExtra("order_id"),
                intent.getStringExtra("order_id_display")
        );

        workerRequestId = value(
                intent.getStringExtra("worker_request_id"),
                ""
        );

        notificationId = value(
                intent.getStringExtra("notification_id"),
                ""
        );
    }

    private void setupViews() {

        TextView title = findViewById(R.id.alert_title);
        TextView body = findViewById(R.id.alert_body);

        TextView customer = findViewById(R.id.detail_customer);
        TextView service = findViewById(R.id.detail_service);
        TextView worker = findViewById(R.id.detail_worker);
        TextView amount = findViewById(R.id.detail_amount);
        TextView date = findViewById(R.id.detail_date);
        TextView time = findViewById(R.id.detail_time);
        TextView location = findViewById(R.id.detail_location);
        TextView booking = findViewById(R.id.detail_booking_id);
        TextView order = findViewById(R.id.detail_order_id);
        TextView workerRequest =
                findViewById(R.id.detail_worker_request_id);

        title.setText(
                display(
                        getIntent().getStringExtra("title"),
                        getDefaultTitle()
                )
        );

        body.setText(
                display(
                        getIntent().getStringExtra("body"),
                        "New Workkerz notification received"
                )
        );

        customer.setText(
                display(
                        getIntent().getStringExtra("customer_name"),
                        "—"
                )
        );

        service.setText(
                display(
                        getIntent().getStringExtra("service"),
                        getIntent().getStringExtra("service_name")
                )
        );

        worker.setText(
                display(
                        getIntent().getStringExtra("worker_name"),
                        "—"
                )
        );

        String amountValue =
                first(
                        getIntent().getStringExtra("amount"),
                        getIntent().getStringExtra("grand_total")
                );

        if (!amountValue.isEmpty()
                && !amountValue.startsWith("₹")) {
            amountValue = "₹" + amountValue;
        }

        amount.setText(
                amountValue.isEmpty() ? "—" : amountValue
        );

        date.setText(
                first(
                        getIntent().getStringExtra("booking_date"),
                        getIntent().getStringExtra("work_date")
                )
        );

        time.setText(
                first(
                        getIntent().getStringExtra("booking_time"),
                        getIntent().getStringExtra("start_time")
                )
        );

        location.setText(
                first(
                        getIntent().getStringExtra("location"),
                        getIntent().getStringExtra("address")
                )
        );

        booking.setText(
                bookingId.isEmpty() ? "—" : bookingId
        );

        order.setText(
                orderId.isEmpty() ? "—" : orderId
        );

        workerRequest.setText(
                workerRequestId.isEmpty()
                        ? "—"
                        : workerRequestId
        );

        Button accept = findViewById(R.id.btn_accept);
        Button reject = findViewById(R.id.btn_reject);

        accept.setOnClickListener(v -> {
            stopAlert();
            sendAction("accept");
            openApp();
        });

        reject.setOnClickListener(v -> {
            stopAlert();
            sendAction("reject");
            finishAndRemoveTask();
        });
    }

    private void startAlert() {
        stopAlert();

        startSound();

        startVibration();

        startTimer();
    }

    private void startTimer() {

        TextView timer =
                findViewById(R.id.alert_timer);

        countDownTimer =
                new CountDownTimer(
                        ALERT_DURATION,
                        1000
                ) {

                    @Override
                    public void onTick(
                            long millisUntilFinished
                    ) {

                        long seconds =
                                millisUntilFinished / 1000;

                        long minutes =
                                seconds / 60;

                        seconds %= 60;

                        timer.setText(
                                String.format(
                                        java.util.Locale.US,
                                        "%02d:%02d",
                                        minutes,
                                        seconds
                                )
                        );
                    }

                    @Override
                    public void onFinish() {

                        timer.setText("00:00");

                        stopAlert();

                        finishAndRemoveTask();
                    }
                };

        countDownTimer.start();
    }

    private void startSound() {

        try {

            int soundId = getSoundResource();

            mediaPlayer =
                    MediaPlayer.create(
                            this,
                            soundId
                    );

            if (mediaPlayer == null) {
                return;
            }

            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(
                                    AudioAttributes.USAGE_ALARM
                            )
                            .setContentType(
                                    AudioAttributes.CONTENT_TYPE_SONIFICATION
                            )
                            .build()
            );

            mediaPlayer.setLooping(true);

            mediaPlayer.start();

        } catch (Exception ignored) {
        }
    }

    private int getSoundResource() {

        if ("order".equalsIgnoreCase(type)) {

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

        if ("worker_request".equalsIgnoreCase(type)
                || "worker-request".equalsIgnoreCase(type)) {

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

        return R.raw.booking;
    }

    private void startVibration() {

        try {

            vibrator =
                    (Vibrator) getSystemService(
                            Context.VIBRATOR_SERVICE
                    );

            if (vibrator == null
                    || !vibrator.hasVibrator()) {
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

                vibrator.vibrate(
                        pattern,
                        0
                );
            }

        } catch (Exception ignored) {
        }
    }

    private void stopAlert() {

        if (countDownTimer != null) {
            countDownTimer.cancel();
            countDownTimer = null;
        }

        try {
            if (vibrator != null) {
                vibrator.cancel();
            }
        } catch (Exception ignored) {
        }

        try {

            if (mediaPlayer != null) {

                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }

                mediaPlayer.reset();
                mediaPlayer.release();
                mediaPlayer = null;
            }

        } catch (Exception ignored) {

            mediaPlayer = null;
        }
    }

    private void sendAction(String action) {

        try {

            Intent intent =
                    new Intent(
                            this,
                            BookingActionReceiver.class
                    );

            intent.putExtra(
                    "action",
                    action
            );

            intent.putExtra(
                    "notification_type",
                    type
            );

            intent.putExtra(
                    "booking_id",
                    bookingId
            );

            intent.putExtra(
                    "order_id",
                    orderId
            );

            intent.putExtra(
                    "worker_request_id",
                    workerRequestId
            );

            intent.putExtra(
                    "notification_id",
                    notificationId
            );

            sendBroadcast(intent);

        } catch (Exception ignored) {
        }
    }

    private void openApp() {

        try {

            Intent launchIntent =
                    getPackageManager()
                            .getLaunchIntentForPackage(
                                    getPackageName()
                            );

            if (launchIntent != null) {

                launchIntent.addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK
                                | Intent.FLAG_ACTIVITY_CLEAR_TOP
                                | Intent.FLAG_ACTIVITY_SINGLE_TOP
                );

                launchIntent.putExtra(
                        "notification_type",
                        type
                );

                launchIntent.putExtra(
                        "booking_id",
                        bookingId
                );

                launchIntent.putExtra(
                        "order_id",
                        orderId
                );

                launchIntent.putExtra(
                        "worker_request_id",
                        workerRequestId
                );

                launchIntent.putExtra(
                        "notification_action",
                        "accept"
                );

                startActivity(launchIntent);
            }

        } catch (Exception ignored) {
        }

        finishAndRemoveTask();
    }

    @Override
    protected void onNewIntent(Intent intent) {

        super.onNewIntent(intent);

        stopAlert();

        setIntent(intent);

        bindIntent(intent);

        setupViews();

        startAlert();
    }

    @Override
    protected void onPause() {

        super.onPause();

        /*
         * Alert intentionally continues while the Activity
         * is temporarily paused.
         */
    }

    @Override
    protected void onDestroy() {

        stopAlert();

        super.onDestroy();
    }

    private String value(
            String primary,
            String fallback
    ) {

        if (primary != null
                && !primary.trim().isEmpty()) {
            return primary;
        }

        return fallback == null ? "" : fallback;
    }

    private String first(
            String primary,
            String fallback
    ) {

        if (primary != null
                && !primary.trim().isEmpty()) {
            return primary;
        }

        if (fallback != null
                && !fallback.trim().isEmpty()) {
            return fallback;
        }

        return "";
    }

    private String display(
            String primary,
            String fallback
    ) {

        String result =
                first(primary, fallback);

        return result.isEmpty()
                ? "—"
                : result;
    }

    private String getDefaultTitle() {

        if ("order".equalsIgnoreCase(type)) {
            return "New E-Aurix Order";
        }

        if ("worker_request".equalsIgnoreCase(type)
                || "worker-request".equalsIgnoreCase(type)) {
            return "New Worker Request";
        }

        return "New Booking Received";
    }
}
