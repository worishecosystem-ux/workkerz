package com.workkerz.admin;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class BookingActionReceiver extends BroadcastReceiver {

    private static final String TAG =
            "BookingActionReceiver";

    @Override
    public void onReceive(
            Context context,
            Intent intent
    ) {

        if (intent == null) {
            return;
        }

        String action =
                intent.getAction();

        String type =
                safe(
                        intent.getStringExtra(
                                "notification_type"
                        )
                );

        String bookingId =
                safe(
                        intent.getStringExtra(
                                "booking_id"
                        )
                );

        String orderId =
                safe(
                        intent.getStringExtra(
                                "order_id"
                        )
                );

        String workerRequestId =
                safe(
                        intent.getStringExtra(
                                "worker_request_id"
                        )
                );

        String notificationId =
                safe(
                        intent.getStringExtra(
                                "notification_id"
                        )
                );

        android.util.Log.e(
                TAG,
                "ACTION=" + action
                        + " TYPE=" + type
                        + " BOOKING=" + bookingId
                        + " ORDER=" + orderId
                        + " WORKER_REQUEST="
                        + workerRequestId
        );

        stopNotification(
                context,
                bookingId,
                orderId,
                workerRequestId,
                notificationId
        );

        if ("WORKKERZ_ACCEPT".equals(action)) {

            Toast.makeText(
                    context,
                    "Opening request...",
                    Toast.LENGTH_SHORT
            ).show();

            openAdmin(
                    context,
                    type,
                    bookingId,
                    orderId,
                    workerRequestId
            );

            return;
        }

        if ("WORKKERZ_REJECT".equals(action)) {

            Toast.makeText(
                    context,
                    "Request rejected",
                    Toast.LENGTH_SHORT
            ).show();

            return;
        }
    }

    private void openAdmin(
            Context context,
            String type,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        try {

            Intent intent =
                    new Intent(
                            context,
                            MainActivity.class
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

            intent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK
                            | Intent.FLAG_ACTIVITY_CLEAR_TOP
                            | Intent.FLAG_ACTIVITY_SINGLE_TOP
            );

            context.startActivity(intent);

        } catch (Exception e) {

            android.util.Log.e(
                    TAG,
                    "OPEN ADMIN ERROR",
                    e
            );
        }
    }

    private void stopNotification(
            Context context,
            String bookingId,
            String orderId,
            String workerRequestId,
            String notificationId
    ) {

        String key;

        if (!bookingId.isEmpty()) {

            key =
                    "booking_" + bookingId;

        } else if (!workerRequestId.isEmpty()) {

            key =
                    "worker_request_"
                            + workerRequestId;

        } else if (!orderId.isEmpty()) {

            key =
                    "order_" + orderId;

        } else {

            key =
                    "notification_"
                            + notificationId;
        }

        NotificationManager manager =
                (NotificationManager)
                        context.getSystemService(
                                Context.NOTIFICATION_SERVICE
                        );

        if (manager != null) {

            manager.cancel(
                    Math.abs(key.hashCode())
            );
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
