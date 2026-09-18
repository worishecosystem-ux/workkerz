package com.workkerz.admin;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "WorkkerzFCM";
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.e(TAG, "===== MAIN ACTIVITY CREATED =====");

        requestNotificationPermission();
        requestFullScreenIntentAccess();
        fetchFirebaseToken();
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (
                    ContextCompat.checkSelfPermission(
                            this,
                            Manifest.permission.POST_NOTIFICATIONS
                    ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{
                                Manifest.permission.POST_NOTIFICATIONS
                        },
                        NOTIFICATION_PERMISSION_REQUEST
                );
            } else {
                Log.e(TAG, "POST_NOTIFICATIONS permission already granted");
            }
        } else {
            Log.e(TAG, "POST_NOTIFICATIONS permission not required on this Android version");
        }
    }

    private void requestFullScreenIntentAccess() {
        if (Build.VERSION.SDK_INT >= 34) {
            try {
                Intent intent = new Intent(
                        Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT,
                        Uri.parse("package:" + getPackageName())
                );
                startActivity(intent);
                Log.e(TAG, "Opened Full Screen Notifications permission settings");
            } catch (Exception e) {
                Log.e(TAG, "Unable to open Full Screen Notifications settings", e);
            }
        }
    }

    private void fetchFirebaseToken() {
        Log.e(TAG, "===== FETCHING FIREBASE TOKEN =====");

        FirebaseMessaging.getInstance()
                .getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Log.e(
                                TAG,
                                "FIREBASE TOKEN FAILED",
                                task.getException()
                        );
                        return;
                    }

                    String token = task.getResult();

                    Log.e(TAG, "========================================");
                    Log.e(TAG, "FIREBASE TOKEN RECEIVED");
                    Log.e(TAG, "TOKEN = " + token);
                    Log.e(TAG, "TOKEN LENGTH = " + token.length());
                    Log.e(TAG, "========================================");
                });
    }
}
