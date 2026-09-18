package com.workkerz.admin;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class WorkkerzFirebaseMessagingService
        extends FirebaseMessagingService {

    private static final String TAG = "WorkkerzFCM";

    /*
     * IMPORTANT:
     *
     * v5 is a fresh channel.
     *
     * Android does not allow changing some channel settings
     * after the channel has already been created.
     */
    private static final String BOOKING_CHANNEL =
            "workkerz_admin_booking_v5";

    private static final String ORDER_CHANNEL =
            "workkerz_admin_order_v5";

    private static final String WORKER_CHANNEL =
            "workkerz_admin_worker_v5";

    private static final String SYSTEM_CHANNEL =
            "workkerz_admin_system_v5";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {

        Log.e(TAG, "========================================");
        Log.e(TAG, "FCM MESSAGE RECEIVED");
        Log.e(TAG, "Message ID = " + remoteMessage.getMessageId());
        Log.e(TAG, "From = " + remoteMessage.getFrom());
        Log.e(TAG, "Data = " + remoteMessage.getData());
        Log.e(
                TAG,
                "Has notification payload = "
                        + (remoteMessage.getNotification() != null)
        );
        Log.e(TAG, "========================================");

        Map<String, String> data =
                remoteMessage.getData();

        /*
         * =========================================================
         * TYPE
         * =========================================================
         */

        String type = getValue(
                data,
                "type",
                "system"
        ).toLowerCase().trim();

        if (
                type.equals("worker-request")
                        || type.equals("workerrequest")
                        || type.equals("worker_request_notification")
        ) {
            type = "worker_request";
        }

        /*
         * =========================================================
         * BASIC DATA
         * =========================================================
         */

        String title = getValue(
                data,
                "title",
                getDefaultTitle(type)
        );

        String body = getValue(
                data,
                "body",
                getDefaultBody(type)
        );

        String customer = getValue(
                data,
                "customer_name",
                getValue(
                        data,
                        "customer",
                        "Customer"
                )
        );

        String service = getValue(
                data,
                "service",
                "Service"
        );

        String location = getValue(
                data,
                "location",
                "Location not available"
        );

        String bookingTime = getValue(
                data,
                "booking_time",
                getValue(
                        data,
                        "time",
                        "Time not specified"
                )
        );

        String workDate = getValue(
                data,
                "work_date",
                ""
        );

        String amount = getValue(
                data,
                "amount",
                "₹0"
        );

        String note = getValue(
                data,
                "note",
                ""
        );

        /*
         * =========================================================
         * IDS
         * =========================================================
         */

        String bookingId = getValue(
                data,
                "booking_id",
                ""
        );

        String orderId = getValue(
                data,
                "order_id",
                ""
        );

        String workerRequestId = getValue(
                data,
                "worker_request_id",
                getValue(
                        data,
                        "workerRequestId",
                        ""
                )
        );

        String notificationId = getValue(
                data,
                "notification_id",
                ""
        );

        /*
         * =========================================================
         * LOG IMPORTANT DATA
         * =========================================================
         */

        Log.e(
                TAG,
                "TYPE = " + type
                        + " | bookingId = " + bookingId
                        + " | orderId = " + orderId
                        + " | workerRequestId = " + workerRequestId
                        + " | notificationId = " + notificationId
        );

        /*
         * =========================================================
         * CHANNEL
         * =========================================================
         */

        String channelId = getChannelId(type);

        createNotificationChannel(
                channelId,
                getChannelName(type)
        );

        /*
         * =========================================================
         * STABLE NOTIFICATION ID
         * =========================================================
         */

        int notificationIntId = getStableId(
                notificationId,
                bookingId,
                orderId,
                workerRequestId
        );

        /*
         * =========================================================
         * NORMAL OPEN APP INTENT
         * =========================================================
         */

        Intent openIntent = new Intent(
                this,
                MainActivity.class
        );

        putNotificationExtras(
                openIntent,
                type,
                title,
                body,
                customer,
                service,
                location,
                bookingTime,
                workDate,
                amount,
                note,
                bookingId,
                orderId,
                workerRequestId,
                notificationId
        );

        openIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent contentPendingIntent =
                PendingIntent.getActivity(
                        this,
                        notificationIntId + 1000,
                        openIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT
                                | PendingIntent.FLAG_IMMUTABLE
                );

        /*
         * =========================================================
         * FULL SCREEN ALERT INTENT
         *
         * IMPORTANT:
         *
         * DO NOT call startActivity() from this Firebase service.
         *
         * Android NotificationManager will decide when the
         * FullScreenAlertActivity should be launched.
         * =========================================================
         */

        Intent fullScreenIntent = new Intent(
                this,
                FullScreenAlertActivity.class
        );

        putNotificationExtras(
                fullScreenIntent,
                type,
                title,
                body,
                customer,
                service,
                location,
                bookingTime,
                workDate,
                amount,
                note,
                bookingId,
                orderId,
                workerRequestId,
                notificationId
        );

        fullScreenIntent.putExtra(
                "notification_action",
                "fullscreen"
        );

        fullScreenIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                        | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        PendingIntent fullScreenPendingIntent =
                PendingIntent.getActivity(
                        this,
                        notificationIntId + 2000,
                        fullScreenIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT
                                | PendingIntent.FLAG_IMMUTABLE
                );

        /*
         * =========================================================
         * NOTIFICATION BUILDER
         * =========================================================
         */

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(
                        this,
                        channelId
                )
                        .setSmallIcon(
                                R.drawable.ic_notification
                        )
                        .setContentTitle(
                                title
                        )
                        .setContentText(
                                getShortText(
                                        type,
                                        customer,
                                        service,
                                        amount
                                )
                        )
                        .setStyle(
                                new NotificationCompat.BigTextStyle()
                                        .setBigContentTitle(title)
                                        .bigText(
                                                buildDetails(
                                                        type,
                                                        body,
                                                        customer,
                                                        service,
                                                        location,
                                                        bookingTime,
                                                        workDate,
                                                        amount,
                                                        note,
                                                        bookingId,
                                                        orderId,
                                                        workerRequestId
                                                )
                                        )
                        )
                        .setPriority(
                                NotificationCompat.PRIORITY_MAX
                        )
                        .setCategory(
                                NotificationCompat.CATEGORY_EVENT
                        )
                        .setVisibility(
                                NotificationCompat.VISIBILITY_PUBLIC
                        )
                        .setAutoCancel(true)
                        .setOngoing(false)
                        .setShowWhen(true)
                        .setContentIntent(
                                contentPendingIntent
                        )
                        /*
                         * Android controls whether this PendingIntent
                         * is actually launched fullscreen.
                         *
                         * true = request fullscreen behaviour.
                         */
                        .setFullScreenIntent(
                                fullScreenPendingIntent,
                                true
                        );

        /*
         * =========================================================
         * ACTION BUTTONS
         * =========================================================
         */

        String actionId = getPrimaryId(
                notificationId,
                bookingId,
                orderId,
                workerRequestId
        );

        boolean canAction =
                (
                        type.equals("booking")
                                || type.equals("order")
                                || type.equals("worker_request")
                )
                        && !actionId.isEmpty();

        if (canAction) {

            Intent acceptIntent =
                    new Intent(
                            this,
                            BookingActionReceiver.class
                    );

            acceptIntent.setAction(
                    "WORKKERZ_ACCEPT"
            );

            putActionExtras(
                    acceptIntent,
                    type,
                    bookingId,
                    orderId,
                    workerRequestId,
                    notificationId
            );

            PendingIntent acceptPendingIntent =
                    PendingIntent.getBroadcast(
                            this,
                            getStableId(
                                    actionId + "_accept",
                                    "",
                                    "",
                                    ""
                            ),
                            acceptIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT
                                    | PendingIntent.FLAG_IMMUTABLE
                    );

            Intent rejectIntent =
                    new Intent(
                            this,
                            BookingActionReceiver.class
                    );

            rejectIntent.setAction(
                    "WORKKERZ_REJECT"
            );

            putActionExtras(
                    rejectIntent,
                    type,
                    bookingId,
                    orderId,
                    workerRequestId,
                    notificationId
            );

            PendingIntent rejectPendingIntent =
                    PendingIntent.getBroadcast(
                            this,
                            getStableId(
                                    actionId + "_reject",
                                    "",
                                    "",
                                    ""
                            ),
                            rejectIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT
                                    | PendingIntent.FLAG_IMMUTABLE
                    );

            builder.addAction(
                    new NotificationCompat.Action.Builder(
                            0,
                            "Accept",
                            acceptPendingIntent
                    ).build()
            );

            builder.addAction(
                    new NotificationCompat.Action.Builder(
                            0,
                            "Reject",
                            rejectPendingIntent
                    ).build()
            );
        }

        /*
         * =========================================================
         * POST NOTIFICATION
         * =========================================================
         */

        NotificationManager notificationManager =
                (NotificationManager)
                        getSystemService(
                                NOTIFICATION_SERVICE
                        );

        if (notificationManager == null) {

            Log.e(
                    TAG,
                    "NotificationManager is NULL"
            );

            return;
        }

        try {

            Log.e(
                    TAG,
                    "BEFORE NOTIFICATION POST"
            );

            Log.e(
                    TAG,
                    "channelId = " + channelId
            );

            Log.e(
                    TAG,
                    "notificationIntId = "
                            + notificationIntId
            );

            Log.e(
                    TAG,
                    "posting fullScreenIntent = true"
            );

            notificationManager.notify(
                    notificationIntId,
                    builder.build()
            );

            Log.e(
                    TAG,
                    "NOTIFICATION POSTED id="
                            + notificationIntId
            );

        } catch (Throwable e) {

            Log.e(
                    TAG,
                    "NOTIFICATION POST FAILED",
                    e
            );
        }
    }

    /*
     * =========================================================
     * EXTRA DATA
     * =========================================================
     */

    private void putNotificationExtras(
            Intent intent,
            String type,
            String title,
            String body,
            String customer,
            String service,
            String location,
            String bookingTime,
            String workDate,
            String amount,
            String note,
            String bookingId,
            String orderId,
            String workerRequestId,
            String notificationId
    ) {

        intent.putExtra(
                "notification_type",
                type
        );

        intent.putExtra(
                "title",
                title
        );

        intent.putExtra(
                "body",
                body
        );

        intent.putExtra(
                "customer_name",
                customer
        );

        intent.putExtra(
                "service",
                service
        );

        intent.putExtra(
                "location",
                location
        );

        intent.putExtra(
                "booking_time",
                bookingTime
        );

        intent.putExtra(
                "work_date",
                workDate
        );

        intent.putExtra(
                "amount",
                amount
        );

        intent.putExtra(
                "note",
                note
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
    }

    /*
     * =========================================================
     * ACTION EXTRAS
     * =========================================================
     */

    private void putActionExtras(
            Intent intent,
            String type,
            String bookingId,
            String orderId,
            String workerRequestId,
            String notificationId
    ) {

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
    }

    /*
     * =========================================================
     * CHANNEL CREATION
     * =========================================================
     */

    private void createNotificationChannel(
            String channelId,
            String channelName
    ) {

        if (
                Build.VERSION.SDK_INT
                        < Build.VERSION_CODES.O
        ) {
            return;
        }

        NotificationManager manager =
                getSystemService(
                        NotificationManager.class
                );

        if (manager == null) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * New channel = fresh Android channel.
         *
         * We intentionally keep notification sound disabled.
         * FullScreenAlertActivity handles the booking alert sound.
         */

        if (
                manager.getNotificationChannel(
                        channelId
                ) != null
        ) {

            return;
        }

        NotificationChannel channel =
                new NotificationChannel(
                        channelId,
                        channelName,
                        NotificationManager.IMPORTANCE_HIGH
                );

        channel.setDescription(
                "Workkerz Admin " + channelName
        );

        channel.setSound(
                null,
                null
        );

        channel.enableVibration(true);

        channel.setVibrationPattern(
                new long[]{
                        0,
                        300,
                        200,
                        300
                }
        );

        channel.enableLights(true);

        channel.setShowBadge(true);

        manager.createNotificationChannel(
                channel
        );

        Log.e(
                TAG,
                "CHANNEL CREATED: " + channelId
        );
    }

    /*
     * =========================================================
     * CHANNEL ID
     * =========================================================
     */

    private String getChannelId(
            String type
    ) {

        switch (type) {

            case "booking":
                return BOOKING_CHANNEL;

            case "order":
                return ORDER_CHANNEL;

            case "worker_request":
                return WORKER_CHANNEL;

            default:
                return SYSTEM_CHANNEL;
        }
    }

    /*
     * =========================================================
     * CHANNEL NAME
     * =========================================================
     */

    private String getChannelName(
            String type
    ) {

        switch (type) {

            case "booking":
                return "New Booking Alerts";

            case "order":
                return "New Order Alerts";

            case "worker_request":
                return "Worker Request Alerts";

            default:
                return "Workkerz Admin Alerts";
        }
    }

    /*
     * =========================================================
     * SHORT TEXT
     * =========================================================
     */

    private String getShortText(
            String type,
            String customer,
            String service,
            String amount
    ) {

        switch (type) {

            case "booking":
                return customer
                        + " booked "
                        + service
                        + " • "
                        + amount;

            case "order":
                return "New order from "
                        + customer
                        + " • "
                        + amount;

            case "worker_request":
                return "New worker request • "
                        + service;

            default:
                return "New Workkerz Admin alert";
        }
    }

    /*
     * =========================================================
     * DETAILS
     * =========================================================
     */

    private String buildDetails(
            String type,
            String body,
            String customer,
            String service,
            String location,
            String bookingTime,
            String workDate,
            String amount,
            String note,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        StringBuilder details =
                new StringBuilder();

        if (!body.isEmpty()) {

            details.append(body);
        }

        if (type.equals("booking")) {

            appendLine(
                    details,
                    "Customer",
                    customer
            );

            appendLine(
                    details,
                    "Service",
                    service
            );

            appendLine(
                    details,
                    "Location",
                    location
            );

            appendLine(
                    details,
                    "Date",
                    workDate
            );

            appendLine(
                    details,
                    "Time",
                    bookingTime
            );

            appendLine(
                    details,
                    "Amount",
                    amount
            );

            if (!bookingId.isEmpty()) {

                appendLine(
                        details,
                        "Booking ID",
                        bookingId
                );
            }

        } else if (type.equals("order")) {

            appendLine(
                    details,
                    "Customer",
                    customer
            );

            appendLine(
                    details,
                    "Location",
                    location
            );

            appendLine(
                    details,
                    "Amount",
                    amount
            );

            if (!orderId.isEmpty()) {

                appendLine(
                        details,
                        "Order ID",
                        orderId
                );
            }

        } else if (
                type.equals("worker_request")
        ) {

            appendLine(
                    details,
                    "Worker",
                    customer
            );

            appendLine(
                    details,
                    "Service",
                    service
            );

            appendLine(
                    details,
                    "Location",
                    location
            );

            appendLine(
                    details,
                    "Date",
                    workDate
            );

            appendLine(
                    details,
                    "Time",
                    bookingTime
            );

            appendLine(
                    details,
                    "Amount",
                    amount
            );

            if (!workerRequestId.isEmpty()) {

                appendLine(
                        details,
                        "Request ID",
                        workerRequestId
                );
            }
        }

        if (!note.isEmpty()) {

            appendLine(
                    details,
                    "Note",
                    note
            );
        }

        return details.toString();
    }

    private void appendLine(
            StringBuilder builder,
            String label,
            String value
    ) {

        if (
                value == null
                        || value.trim().isEmpty()
        ) {
            return;
        }

        if (builder.length() > 0) {

            builder.append("\n");
        }

        builder.append(label)
                .append(": ")
                .append(value);
    }

    /*
     * =========================================================
     * DEFAULT TITLE
     * =========================================================
     */

    private String getDefaultTitle(
            String type
    ) {

        switch (type) {

            case "booking":
                return "New Booking";

            case "order":
                return "New Order";

            case "worker_request":
                return "New Worker Request";

            default:
                return "Workkerz Admin";
        }
    }

    /*
     * =========================================================
     * DEFAULT BODY
     * =========================================================
     */

    private String getDefaultBody(
            String type
    ) {

        switch (type) {

            case "booking":
                return "A new booking has arrived.";

            case "order":
                return "A new order has arrived.";

            case "worker_request":
                return "A new worker request has arrived.";

            default:
                return "You have a new Workkerz Admin notification.";
        }
    }

    /*
     * =========================================================
     * VALUE
     * =========================================================
     */

    private String getValue(
            Map<String, String> data,
            String key,
            String fallback
    ) {

        if (data == null) {
            return fallback;
        }

        String value = data.get(key);

        if (
                value == null
                        || value.trim().isEmpty()
        ) {
            return fallback;
        }

        return value;
    }

    /*
     * =========================================================
     * PRIMARY ID
     * =========================================================
     */

    private String getPrimaryId(
            String notificationId,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        if (
                notificationId != null
                        && !notificationId.trim().isEmpty()
        ) {
            return notificationId;
        }

        if (
                bookingId != null
                        && !bookingId.trim().isEmpty()
        ) {
            return bookingId;
        }

        if (
                orderId != null
                        && !orderId.trim().isEmpty()
        ) {
            return orderId;
        }

        if (
                workerRequestId != null
                        && !workerRequestId.trim().isEmpty()
        ) {
            return workerRequestId;
        }

        return "";
    }

    /*
     * =========================================================
     * STABLE ID
     * =========================================================
     */

    private int getStableId(
            String notificationId,
            String bookingId,
            String orderId,
            String workerRequestId
    ) {

        String id = getPrimaryId(
                notificationId,
                bookingId,
                orderId,
                workerRequestId
        );

        if (id.isEmpty()) {

            id = String.valueOf(
                    System.currentTimeMillis()
            );
        }

        int hash = id.hashCode();

        if (hash == Integer.MIN_VALUE) {
            return Integer.MAX_VALUE;
        }

        return Math.abs(hash);
    }

    /*
     * =========================================================
     * TOKEN REFRESH
     * =========================================================
     */

    @Override
    public void onNewToken(
            String token
    ) {

        super.onNewToken(token);

        Log.e(
                TAG,
                "FCM TOKEN REFRESHED = " + token
        );
    }
}