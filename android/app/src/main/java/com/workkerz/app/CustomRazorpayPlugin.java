package com.workkerz.app;

import android.app.Activity;
import android.content.Intent;

import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CustomRazorpay")
public class CustomRazorpayPlugin extends Plugin {

    @PluginMethod
    public void startPayment(PluginCall call) {
        String keyId = call.getString("keyId");
        String orderId = call.getString("orderId");
        String amount = call.getString("amount");

        if (keyId == null || keyId.trim().isEmpty()
                || orderId == null || orderId.trim().isEmpty()
                || amount == null || amount.trim().isEmpty()) {
            call.reject("Missing Razorpay order details.");
            return;
        }

        Intent intent = new Intent(
            getContext(),
            CustomRazorpayActivity.class
        );

        intent.putExtra("keyId", keyId);
        intent.putExtra("orderId", orderId);
        intent.putExtra("amount", amount);
        intent.putExtra("currency", call.getString("currency", "INR"));
        intent.putExtra("customerName", call.getString("customerName", "Customer"));
        intent.putExtra("customerEmail", call.getString("customerEmail", ""));
        intent.putExtra("customerPhone", call.getString("customerPhone", ""));

        startActivityForResult(call, intent, "handlePaymentResult");
    }

    @ActivityCallback
    private void handlePaymentResult(
            PluginCall call,
            ActivityResult result
    ) {
        if (call == null) return;

        if (result == null
                || result.getResultCode() != Activity.RESULT_OK
                || result.getData() == null) {
            call.reject(
                "Payment cancelled or interrupted. Check payment status before retrying."
            );
            return;
        }

        Intent data = result.getData();

        if (!data.getBooleanExtra("success", false)) {
            String error = data.getStringExtra("error");
            call.reject(error != null ? error : "Payment was not completed.");
            return;
        }

        JSObject response = new JSObject();
        response.put("razorpay_order_id", data.getStringExtra("razorpay_order_id"));
        response.put("razorpay_payment_id", data.getStringExtra("razorpay_payment_id"));
        response.put("razorpay_signature", data.getStringExtra("razorpay_signature"));

        call.resolve(response);
    }
}
