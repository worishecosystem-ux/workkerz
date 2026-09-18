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
        int bg = Color.rgb(246, 247, 249);
        int white = Color.WHITE;
        int black = Color.rgb(24, 24, 27);
        int gray = Color.rgb(105, 105, 110);
        int green = Color.rgb(20, 150, 85);
        int red = Color.rgb(220, 65, 65);
        int border = Color.rgb(232, 233, 236);

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
        root.setBackgroundColor(bg);

        int pad = dp(18);
        root.setPadding(pad, dp(16), pad, dp(12));

        // HEADER
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);

        TextView brand = text("WORKKERZ", 18, black, true);
        brand.setLetterSpacing(0.08f);

        TextView live = text("  ● LIVE", 11, green, true);
        live.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout.LayoutParams brandLp =
                new LinearLayout.LayoutParams(0, -2, 1);

        header.addView(brand, brandLp);
        header.addView(live);

        root.addView(header);

        // TOP ALERT
        LinearLayout alert = roundedContainer(white, dp(16));

        LinearLayout alertRow = new LinearLayout(this);
        alertRow.setOrientation(LinearLayout.HORIZONTAL);
        alertRow.setGravity(Gravity.CENTER_VERTICAL);

        TextView icon = text("✓", 22, white, true);
        icon.setGravity(Gravity.CENTER);

        LinearLayout.LayoutParams iconLp =
                new LinearLayout.LayoutParams(dp(46), dp(46));
        icon.setBackgroundColor(green);

        alertRow.addView(icon, iconLp);

        LinearLayout alertText = new LinearLayout(this);
        alertText.setOrientation(LinearLayout.VERTICAL);
        alertText.setPadding(dp(12), 0, 0, 0);

        TextView heading = text(title, 18, black, true);
        TextView sub = text("A new booking needs your attention", 12, gray, false);

        alertText.addView(heading);
        alertText.addView(sub);

        alertRow.addView(
                alertText,
                new LinearLayout.LayoutParams(0, -2, 1)
        );

        alert.addView(alertRow);

        LinearLayout.LayoutParams alertLp =
                new LinearLayout.LayoutParams(-1, -2);
        alertLp.setMargins(0, dp(18), 0, dp(12));
        root.addView(alert, alertLp);

        // BOOKING CARD
        LinearLayout card = roundedContainer(white, dp(18));

        TextView badge = text("NEW BOOKING", 11, green, true);
        badge.setPadding(dp(10), dp(6), dp(10), dp(6));
        badge.setBackgroundColor(Color.rgb(232, 249, 239));

        LinearLayout.LayoutParams badgeLp =
                new LinearLayout.LayoutParams(-2, -2);
        badgeLp.setMargins(0, 0, 0, dp(10));
        card.addView(badge, badgeLp);

        TextView customerView = text(customer, 25, black, true);
        card.addView(customerView);

        TextView serviceView = text(service, 15, gray, false);
        serviceView.setPadding(0, dp(2), 0, dp(14));
        card.addView(serviceView);

        // AMOUNT
        LinearLayout amountRow = new LinearLayout(this);
        amountRow.setOrientation(LinearLayout.HORIZONTAL);
        amountRow.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout amountText = new LinearLayout(this);
        amountText.setOrientation(LinearLayout.VERTICAL);

        amountText.addView(text("BOOKING AMOUNT", 10, gray, true));

        TextView amountView = text("₹" + amount, 27, black, true);
        amountText.addView(amountView);

        amountRow.addView(
                amountText,
                new LinearLayout.LayoutParams(0, -2, 1)
        );

        TextView statusView =
                text(status.toUpperCase(), 11, green, true);
        statusView.setGravity(Gravity.CENTER);
        statusView.setPadding(dp(10), dp(7), dp(10), dp(7));
        statusView.setBackgroundColor(Color.rgb(232, 249, 239));

        amountRow.addView(statusView);

        card.addView(amountRow);

        // DIVIDER
        View divider = new View(this);
        divider.setBackgroundColor(border);

        LinearLayout.LayoutParams dividerLp =
                new LinearLayout.LayoutParams(-1, dp(1));
        dividerLp.setMargins(0, dp(16), 0, dp(14));
        card.addView(divider, dividerLp);

        // DETAILS
        card.addView(detailRow("ORDER ID", orderId, black));
        card.addView(detailRow("DATE & TIME",
                workDate + "  •  " + bookingTime, black));
        card.addView(detailRow("LOCATION", location, black));

        TextView bodyView = text(body, 12, gray, false);
        bodyView.setPadding(0, dp(12), 0, 0);
        card.addView(bodyView);

        LinearLayout.LayoutParams cardLp =
                new LinearLayout.LayoutParams(-1, 0, 1);
        root.addView(card, cardLp);

        // BOTTOM ACTIONS
        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER_VERTICAL);
        actions.setPadding(0, dp(12), 0, 0);

        Button reject = actionButton("Reject", red);
        Button accept = actionButton("Accept Booking", green);

        LinearLayout.LayoutParams rejectLp =
                new LinearLayout.LayoutParams(0, dp(56), 1);
        rejectLp.setMargins(0, 0, dp(6), 0);

        LinearLayout.LayoutParams acceptLp =
                new LinearLayout.LayoutParams(0, dp(56), 1);
        acceptLp.setMargins(dp(6), 0, 0, 0);

        actions.addView(reject, rejectLp);
        actions.addView(accept, acceptLp);

        root.addView(actions);

        accept.setOnClickListener(v ->
                sendAction("accept", bookingId)
        );

        reject.setOnClickListener(v ->
                sendAction("reject", bookingId)
        );

        setContentView(root);
    }

    private LinearLayout roundedContainer(int color, int radius) {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(dp(16), dp(16), dp(16), dp(16));

        android.graphics.drawable.GradientDrawable bg =
                new android.graphics.drawable.GradientDrawable();

        bg.setColor(color);
        bg.setCornerRadius(radius);

        layout.setBackground(bg);

        return layout;
    }

    private LinearLayout detailRow(
            String label,
            String value,
            int valueColor
    ) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.VERTICAL);
        row.setPadding(0, dp(4), 0, dp(8));

        row.addView(text(label, 10, Color.rgb(125, 125, 130), true));
        row.addView(text(value, 14, valueColor, false));

        return row;
    }

    private Button actionButton(String label, int color) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(14);
        button.setTextColor(Color.WHITE);
        button.setTypeface(null, Typeface.BOLD);
        button.setAllCaps(false);
        button.setGravity(Gravity.CENTER);

        android.graphics.drawable.GradientDrawable bg =
                new android.graphics.drawable.GradientDrawable();

        bg.setColor(color);
        bg.setCornerRadius(dp(14));

        button.setBackground(bg);

        return button;
    }

    private int dp(int value) {
        return Math.round(
                value * getResources().getDisplayMetrics().density
        );
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
