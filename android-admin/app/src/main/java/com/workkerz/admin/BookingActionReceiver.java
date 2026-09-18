package com.workkerz.admin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BookingActionReceiver extends BroadcastReceiver {

    private static final String TAG = "BookingActionReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {

        if (intent == null) {
            return;
        }

        String action = intent.getStringExtra("action");
        String bookingId = intent.getStringExtra("booking_id");

        Log.e(TAG, "========================================");
        Log.e(TAG, "BOOKING ACTION RECEIVED");
        Log.e(TAG, "ACTION = " + action);
        Log.e(TAG, "BOOKING ID = " + bookingId);
        Log.e(TAG, "========================================");

        Intent main = new Intent(context, MainActivity.class);

        main.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_CLEAR_TOP |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        main.putExtra("booking_action", action);
        main.putExtra("booking_id", bookingId);

        context.startActivity(main);
    }
}
