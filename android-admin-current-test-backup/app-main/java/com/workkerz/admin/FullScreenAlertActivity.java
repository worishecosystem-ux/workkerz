package com.workkerz.admin;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class FullScreenAlertActivity extends Activity {

    private String getExtra(String key, String fallback) {
        String value = getIntent().getStringExtra(key);
        return value == null || value.trim().isEmpty() ? fallback : value;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);

        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );

        if (android.os.Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }

        buildUI();
    }

    private TextView text(String value, float size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(size);
        t.setTextColor(color);
        t.setTypeface(null, bold ? Typeface.BOLD : Typeface.NORMAL);
        t.setPadding(0, 6, 0, 6);
        return t;
    }

    private void buildUI() {
        int black = Color.rgb(20, 20, 20);
        int gray = Color.rgb(100, 100, 100);
        int white = Color.WHITE;

        String title = getExtra("title", "New Booking Received");
        String body = getExtra("body", "A new booking has been received.");
        String customer = getExtra("customer_name", "Customer");
        String service = getExtra("service", "Service");
        String orderId = getExtra("order_id_display", "Workkerz Booking");
        String amount = getExtra("amount", "0");
        String status = getExtra("status", "pending");
        String location = getExtra("location", "Location unavailable");
        String bookingTime = getExtra("booking_time", "Time not specified");
        String workDate = getExtra("work_date", "Date not specified");
        String bookingId = getExtra("booking_id", "");

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(248, 248, 248));
        root.setPadding(28, 32, 28, 28);

        TextView brand = text("WORKKERZ", 15, black, true);
        brand.setGravity(Gravity.CENTER);
        root.addView(
                brand,
                new LinearLayout.LayoutParams(
                        -1,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                )
        );

        TextView heading = text(title, 26, black, true);
        heading.setGravity(Gravity.CENTER);
        heading.setPadding(0, 22, 0, 8);
        root.addView(heading);

        TextView sub = text(body, 15, gray, false);
        sub.setGravity(Gravity.CENTER);
        sub.setPadding(20, 0, 20, 20);
        root.addView(sub);

        ScrollView scroll = new ScrollView(this);

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(26, 26, 26, 26);
        card.setBackgroundColor(white);

        card.addView(text("NEW BOOKING", 12, Color.rgb(20, 120, 70), true));
        card.addView(text(customer, 23, black, true));
        card.addView(text(service, 16, gray, false));

        card.addView(text("Order ID", 12, gray, false));
        card.addView(text(orderId, 16, black, true));

        card.addView(text("Amount", 12, gray, false));
        card.addView(text("₹" + amount, 22, black, true));

        card.addView(text("Status", 12, gray, false));
        card.addView(text(status.toUpperCase(), 15, Color.rgb(20, 120, 70), true));

        card.addView(text("Date & Time", 12, gray, false));
        card.addView(text(workDate + " • " + bookingTime, 15, black, false));

        card.addView(text("Location", 12, gray, false));
        card.addView(text(location, 15, black, false));

        scroll.addView(card);

        root.addView(
                scroll,
                new LinearLayout.LayoutParams(
                        -1,
                        0,
                        1
                )
        );

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        buttons.setGravity(Gravity.CENTER);
        buttons.setPadding(0, 20, 0, 0);

        Button reject = new Button(this);
        reject.setText("REJECT");
        reject.setTextColor(Color.WHITE);
        reject.setBackgroundColor(Color.rgb(180, 45, 45));

        Button accept = new Button(this);
        accept.setText("ACCEPT");
        accept.setTextColor(Color.WHITE);
        accept.setBackgroundColor(Color.rgb(25, 120, 70));

        LinearLayout.LayoutParams bp =
                new LinearLayout.LayoutParams(0, 58, 1);

        bp.setMargins(6, 0, 6, 0);

        buttons.addView(reject, bp);
        buttons.addView(accept, bp);

        root.addView(buttons);

        accept.setOnClickListener(v -> {
            sendAction("accept", bookingId);
        });

        reject.setOnClickListener(v -> {
            sendAction("reject", bookingId);
        });

        setContentView(root);
    }

    private void sendAction(String action, String bookingId) {
        Intent intent = new Intent(this, BookingActionReceiver.class);
        intent.setAction("com.workkerz.admin.BOOKING_ACTION");
        intent.putExtra("action", action);
        intent.putExtra("booking_id", bookingId);
        sendBroadcast(intent);

        Intent main = new Intent(this, MainActivity.class);
        main.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );
        main.putExtra("booking_action", action);
        main.putExtra("booking_id", bookingId);
        startActivity(main);

        finish();
    }
}
