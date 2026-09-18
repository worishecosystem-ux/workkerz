package com.workkerz.admin;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class BookingActionReceiver extends BroadcastReceiver {

    private static final String TAG =
            "BookingActionReceiver";

    @Override
    public void onReceive(
            Context context,
            Intent intent
    ) {
        String action =
                intent.getStringExtra("action");

        String type =
                intent.getStringExtra("notification_type");

        String bookingId =
                intent.getStringExtra("booking_id");

        String orderId =
                intent.getStringExtra("order_id");

        String workerRequestId =
                intent.getStringExtra("worker_request_id");

        Log.e(
                TAG,
                "ACTION=" + action
                        + " TYPE=" + type
                        + " BOOKING=" + bookingId
                        + " ORDER=" + orderId
                        + " WORKER_REQUEST="
                        + workerRequestId
        );

        Intent openIntent =
                new Intent(
                        context,
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
                "notification_action",
                action
        );

        openIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        context.startActivity(openIntent);
    }
}
