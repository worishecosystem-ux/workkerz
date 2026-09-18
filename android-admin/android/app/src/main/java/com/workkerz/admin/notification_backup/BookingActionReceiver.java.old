package com.workkerz.admin;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class BookingActionReceiver
        extends BroadcastReceiver {

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
                getValue(
                        intent,
                        "notification_type"
                );

        String bookingId =
                getValue(
                        intent,
                        "booking_id"
                );

        String orderId =
                getValue(
                        intent,
                        "order_id"
                );

        String workerRequestId =
                getValue(
                        intent,
                        "worker_request_id"
                );

        String notificationId =
                getValue(
                        intent,
                        "notification_id"
                );

        /*
         * =====================================================
         * PRIMARY ID
         * =====================================================
         *
         * Same priority as WorkkerzFirebaseMessagingService:
         *
         * booking_id
         * order_id
         * worker_request_id
         * notification_id
         *
         */

        String targetId =
                getPrimaryId(
                        bookingId,
                        orderId,
                        workerRequestId,
                        notificationId
                );

        /*
         * =====================================================
         * NOTHING TO PROCESS
         * =====================================================
         */

        if (targetId.isEmpty()) {
            Toast.makeText(
                    context,
                    "Request ID not found",
                    Toast.LENGTH_SHORT
            ).show();

            return;
        }

        /*
         * =====================================================
         * CANCEL NOTIFICATION
         * =====================================================
         */

        cancelNotification(
                context,
                notificationId,
                bookingId,
                orderId,
                workerRequestId
        );

        /*
         * =====================================================
         * ACCEPT
         * =====================================================
         */

        if (
                "WORKKERZ_ACCEPT"
                        .equals(action)
        ) {

            Toast.makeText(
                    context,
                    getAcceptMessage(type),
                    Toast.LENGTH_SHORT
            ).show();

            openApp(
                    context,
                    type,
                    bookingId,
                    workerRequestId,
                    orderId,
                    notificationId,
                    "accept"
            );

            return;
        }

        /*
         * =====================================================
         * REJECT
         * =====================================================
         */

        if (
                "WORKKERZ_REJECT"
                        .equals(action)
        ) {

            Toast.makeText(
                    context,
                    getRejectMessage(type),
                    Toast.LENGTH_SHORT
            ).show();

            /*
             * IMPORTANT:
             *
             * Reject action only opens the app with
             * notification_action = reject.
             *
             * Actual Supabase status update should be
             * handled by the app/API.
             */

            openApp(
                    context,
                    type,
                    bookingId,
                    workerRequestId,
                    orderId,
                    notificationId,
                    "reject"
            );

            return;
        }
    }

    /*
     * =========================================================
     * CANCEL NOTIFICATION
     * =========================================================
     */

    private void cancelNotification(
            Context context,
            String notificationId,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        NotificationManager manager =
                (NotificationManager)
                        context.getSystemService(
                                Context.NOTIFICATION_SERVICE
                        );

        if (manager == null) {
            return;
        }

        int id =
                getStableId(
                        notificationId,
                        bookingId,
                        orderId,
                        workerRequestId
                );

        manager.cancel(id);
    }

    /*
     * =========================================================
     * OPEN APP
     * =========================================================
     */

    private void openApp(
            Context context,
            String type,
            String bookingId,
            String workerRequestId,
            String orderId,
            String notificationId,
            String action
    ) {

        Intent openIntent =
                new Intent(
                        context,
                        MainActivity.class
                );

        /*
         * =====================================================
         * ACTION
         * =====================================================
         */

        openIntent.putExtra(
                "notification_action",
                action
        );

        /*
         * =====================================================
         * TYPE
         * =====================================================
         */

        openIntent.putExtra(
                "notification_type",
                type
        );

        /*
         * =====================================================
         * IDS
         * =====================================================
         */

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
                "notification_id",
                notificationId
        );

        /*
         * =====================================================
         * FLAGS
         * =====================================================
         */

        openIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
                        |
                Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        context.startActivity(
                openIntent
        );
    }

    /*
     * =========================================================
     * PRIMARY ID
     * =========================================================
     */

    private String getPrimaryId(
            String bookingId,
            String orderId,
            String workerRequestId,
            String notificationId
    ) {

        /*
         * Same priority used by
         * WorkkerzFirebaseMessagingService.
         */

        if (
                bookingId != null
                        &&
                !bookingId.trim().isEmpty()
        ) {

            return bookingId.trim();
        }

        if (
                orderId != null
                        &&
                !orderId.trim().isEmpty()
        ) {

            return orderId.trim();
        }

        if (
                workerRequestId != null
                        &&
                !workerRequestId.trim().isEmpty()
        ) {

            return workerRequestId.trim();
        }

        if (
                notificationId != null
                        &&
                !notificationId.trim().isEmpty()
        ) {

            return notificationId.trim();
        }

        return "";
    }

    /*
     * =========================================================
     * STABLE NOTIFICATION ID
     * =========================================================
     */

    private int getStableId(
            String notificationId,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        String id =
                getPrimaryId(
                        bookingId,
                        orderId,
                        workerRequestId,
                        notificationId
                );

        if (
                id == null
                        ||
                id.trim().isEmpty()
        ) {

            id =
                    String.valueOf(
                            System.currentTimeMillis()
                    );
        }

        return Math.abs(
                id.hashCode()
        );
    }

    /*
     * =========================================================
     * GET STRING EXTRA
     * =========================================================
     */

    private String getValue(
            Intent intent,
            String key
    ) {

        if (intent == null) {
            return "";
        }

        String value =
                intent.getStringExtra(key);

        if (
                value == null
                        ||
                value.trim().isEmpty()
        ) {
            return "";
        }

        return value.trim();
    }

    /*
     * =========================================================
     * ACCEPT MESSAGE
     * =========================================================
     */

    private String getAcceptMessage(
            String type
    ) {

        if (
                "order".equals(type)
        ) {

            return "Opening order...";
        }

        if (
                "worker_request".equals(type)
        ) {

            return "Opening worker request...";
        }

        if (
                "booking".equals(type)
        ) {

            return "Opening booking...";
        }

        return "Opening request...";
    }

    /*
     * =========================================================
     * REJECT MESSAGE
     * =========================================================
     */

    private String getRejectMessage(
            String type
    ) {

        if (
                "order".equals(type)
        ) {

            return "Order rejected";
        }

        if (
                "worker_request".equals(type)
        ) {

            return "Worker request rejected";
        }

        if (
                "booking".equals(type)
        ) {

            return "Booking rejected";
        }

        return "Request rejected";
    }
}