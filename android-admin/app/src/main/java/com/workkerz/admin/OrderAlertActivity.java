package com.workkerz.admin;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class OrderAlertActivity extends AppCompatActivity {

    private CountDownTimer timer;

    private TextView txtCustomer;
    private TextView txtOrderId;
    private TextView txtAmount;
    private TextView txtStatus;
    private TextView txtTimer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        showOverLockScreen();

        setContentView(R.layout.activity_order_alert);

        bindViews();
        loadOrderData();
        setupButtons();
        startTimer();
    }

    private void bindViews() {

        txtCustomer = findViewById(R.id.txtCustomer);
        txtOrderId = findViewById(R.id.txtOrderId);
        txtAmount = findViewById(R.id.txtAmount);
        txtStatus = findViewById(R.id.txtStatus);
        txtTimer = findViewById(R.id.txtTimer);
    }

    private void loadOrderData() {

        Intent intent = getIntent();

        String customer =
                getExtra(intent, "customer_name", "customer", "name");

        String orderId =
                getExtra(intent, "order_id", "orderId", "id");

        String amount =
                getExtra(intent, "amount", "grand_total", "grandTotal", "total");

        String status =
                getExtra(intent, "status");

        if (customer == null || customer.trim().isEmpty()) {
            customer = "Customer";
        }

        if (orderId == null || orderId.trim().isEmpty()) {
            orderId = "New Order";
        }

        if (amount == null || amount.trim().isEmpty()) {
            amount = "0";
        }

        if (status == null || status.trim().isEmpty()) {
            status = "pending";
        }

        txtCustomer.setText(
                customer + " · #" + orderId
        );

        txtOrderId.setText(
                "#" + orderId
        );

        if (!amount.startsWith("₹")) {
            amount = "₹" + amount;
        }

        txtAmount.setText(amount);

        txtStatus.setText(
                "● " + status.toUpperCase()
        );
    }

    private String getExtra(
            Intent intent,
            String... keys
    ) {

        for (String key : keys) {

            String value = intent.getStringExtra(key);

            if (value != null && !value.trim().isEmpty()) {
                return value;
            }
        }

        return null;
    }

    private void setupButtons() {

        View accept =
                findViewById(R.id.btnAccept);

        View reject =
                findViewById(R.id.btnReject);

        View close =
                findViewById(R.id.btnClose);

        View details =
                findViewById(R.id.btnViewDetails);

        accept.setOnClickListener(v -> {

            stopAlert();

            finishAndRemoveTask();
        });

        reject.setOnClickListener(v -> {

            stopAlert();

            finishAndRemoveTask();
        });

        close.setOnClickListener(v -> {

            // Close button also stops the active alert.
            stopAlert();

            finishAndRemoveTask();
        });

        details.setOnClickListener(v -> {

            // Details navigation will be connected
            // to the existing Admin order page later.
        });
    }

    private void startTimer() {

        if (timer != null) {
            timer.cancel();
        }

        timer = new CountDownTimer(
                15000,
                1000
        ) {

            @Override
            public void onTick(long millisUntilFinished) {

                long seconds =
                        millisUntilFinished / 1000;

                txtTimer.setText(
                        String.format(
                                "00:%02d",
                                seconds
                        )
                );
            }

            @Override
            public void onFinish() {

                txtTimer.setText("00:00");
            }

        };

        timer.start();
    }

    private void stopAlert() {

        Intent serviceIntent =
                new Intent(
                        this,
                        OrderAlertService.class
                );

        stopService(serviceIntent);

        if (timer != null) {
            timer.cancel();
            timer = null;
        }
    }

    private void showOverLockScreen() {

        Window window = getWindow();

        window.addFlags(
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
        );

        if (android.os.Build.VERSION.SDK_INT >= 27) {

            setShowWhenLocked(true);
            setTurnScreenOn(true);

            KeyguardManager keyguardManager =
                    (KeyguardManager)
                            getSystemService(
                                    Context.KEYGUARD_SERVICE
                            );

            if (keyguardManager != null) {

                keyguardManager.requestDismissKeyguard(
                        this,
                        null
                );
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {

        super.onNewIntent(intent);

        setIntent(intent);

        loadOrderData();
    }

    @Override
    public void onBackPressed() {

        // Back is disabled while order alert is active.
    }

    @Override
    protected void onDestroy() {

        if (timer != null) {
            timer.cancel();
            timer = null;
        }

        super.onDestroy();
    }
}
