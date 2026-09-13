package com.workkerz.admin;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity
        extends BridgeActivity {

    @Override
    public void onCreate(
            Bundle savedInstanceState
    ) {

        super.onCreate(
                savedInstanceState
        );

        handleNotificationIntent(
                getIntent()
        );
    }

    @Override
    protected void onNewIntent(
            Intent intent
    ) {

        super.onNewIntent(
                intent
        );

        setIntent(intent);

        handleNotificationIntent(
                intent
        );
    }

    private void handleNotificationIntent(
            Intent intent
    ) {

        if (intent == null) {
            return;
        }

        String type =
                intent.getStringExtra(
                        "notification_type"
                );

        String bookingId =
                intent.getStringExtra(
                        "booking_id"
                );

        String workerRequestId =
                intent.getStringExtra(
                        "worker_request_id"
                );

        String orderId =
                intent.getStringExtra(
                        "order_id"
                );

        String action =
                intent.getStringExtra(
                        "notification_action"
                );

        if (
                type == null
                        &&
                bookingId == null
                        &&
                workerRequestId == null
                        &&
                orderId == null
        ) {
            return;
        }

        if (bridge == null) {
            return;
        }

        JSObject data =
                new JSObject();

        data.put(
                "type",
                type == null
                        ? ""
                        : type
        );

        data.put(
                "booking_id",
                bookingId == null
                        ? ""
                        : bookingId
        );

        data.put(
                "worker_request_id",
                workerRequestId == null
                        ? ""
                        : workerRequestId
        );

        data.put(
                "order_id",
                orderId == null
                        ? ""
                        : orderId
        );

        data.put(
                "action",
                action == null
                        ? "open"
                        : action
        );

        bridge.triggerWindowJSEvent(
                "workkerzNotificationOpen",
                data.toString()
        );
    }
}
