package com.workkerz.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.HttpURLConnection
import java.net.URL

class WorkkerzFirebaseMessagingService :
    FirebaseMessagingService() {

    companion object {
        private const val TAG = "WORKKERZ_FCM"
        private const val CHANNEL_ID = "workkerz_notifications"
        private const val CHANNEL_NAME = "Workkerz Notifications"
        private const val CHANNEL_DESCRIPTION = "Workkerz push notifications"
        private const val DEFAULT_NOTIFICATION_ID = 1001
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        Log.d(TAG, "================================")
        Log.d(TAG, "onMessageReceived()")

        val data = remoteMessage.data

        Log.d(TAG, "DATA = $data")
        Log.d(TAG, "TRACE 1")

        Log.d(TAG, "TRACE 2 - before title")

        val title =
            data["title"]
                ?: remoteMessage.notification?.title
                ?: "Workkerz"

        Log.d(TAG, "TRACE 3 - title ready")

        Log.d(TAG, "TRACE 4 - before message")

        val message =
            data["body"]
                ?: remoteMessage.notification?.body
                ?: ""

        Log.d(TAG, "TRACE 5 - message ready")

        Log.d(TAG, "TRACE 6 - before image")

        val imageUrl =
            data["image_url"]
                ?: remoteMessage.notification?.imageUrl?.toString()

        Log.d(TAG, "TRACE 7 - image ready")

        Log.d(TAG, "TRACE 8 - before action")

        val actionUrl = data["action_url"]

        Log.d(TAG, "TRACE 9 - action ready")

        Log.d(TAG, "TITLE = $title")
        Log.d(TAG, "MESSAGE = $message")
        Log.d(TAG, "IMAGE URL = $imageUrl")
        Log.d(TAG, "ACTION URL = $actionUrl")

        Log.d(TAG, "TRACE 10 - before notification id")

        val notificationId =
            data["notification_id"]?.hashCode()
                ?: DEFAULT_NOTIFICATION_ID

        Log.d(TAG, "TRACE 11 - notification id ready")

        Log.d(TAG, "TRACE 12")
        Log.d(TAG, "BEFORE showNotification()")

        showNotification(
            title = title,
            message = message,
            imageUrl = imageUrl,
            actionUrl = actionUrl,
            notificationId = notificationId
        )

        Log.d(TAG, "AFTER showNotification()")
    }

    private fun showNotification(
        title: String,
        message: String,
        imageUrl: String?,
        actionUrl: String?,
        notificationId: Int
    ) {
        Log.d(TAG, "ENTERED showNotification()")

        createNotificationChannel()

        Log.d(TAG, "AFTER createNotificationChannel()")

        val intent =
            if (!actionUrl.isNullOrBlank()) {
                Intent(
                    Intent.ACTION_VIEW,
                    Uri.parse(actionUrl)
                )
            } else {
                Intent(
                    this,
                    MainActivity::class.java
                )
            }

        intent.flags =
            Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP

        val pendingIntent =
            PendingIntent.getActivity(
                this,
                notificationId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
            )

        var bitmap: Bitmap? = null

        if (!imageUrl.isNullOrBlank()) {
            Log.d(TAG, "Downloading notification image...")

            bitmap = downloadImage(imageUrl)

            if (bitmap != null) {
                Log.d(TAG, "IMAGE DOWNLOAD SUCCESS")
                Log.d(
                    TAG,
                    "IMAGE SIZE = ${bitmap.width}x${bitmap.height}"
                )
            } else {
                Log.e(TAG, "IMAGE DOWNLOAD FAILED")
            }
        } else {
            Log.d(TAG, "NO IMAGE URL")
        }

        val builder =
            NotificationCompat.Builder(
                this,
                CHANNEL_ID
            )
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setDefaults(NotificationCompat.DEFAULT_ALL)

        if (bitmap != null) {
            Log.d(TAG, "Applying BigPictureStyle")

            builder.setStyle(
                NotificationCompat.BigPictureStyle()
                    .bigPicture(bitmap)
                    .bigLargeIcon(null as Bitmap?)
                    .setBigContentTitle(title)
                    .setSummaryText(message)
            )
        } else {
            Log.d(TAG, "Using BigTextStyle")

            builder.setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(message)
            )
        }

        val manager =
            getSystemService(
                Context.NOTIFICATION_SERVICE
            ) as NotificationManager

        Log.d(
            TAG,
            "SHOWING NOTIFICATION ID = $notificationId"
        )

        manager.notify(
            notificationId,
            builder.build()
        )

        Log.d(TAG, "NOTIFICATION DISPLAYED")
        Log.d(TAG, "================================")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager =
                getSystemService(
                    Context.NOTIFICATION_SERVICE
                ) as NotificationManager

            if (
                manager.getNotificationChannel(
                    CHANNEL_ID
                ) == null
            ) {
                val channel =
                    NotificationChannel(
                        CHANNEL_ID,
                        CHANNEL_NAME,
                        NotificationManager.IMPORTANCE_HIGH
                    )

                channel.description = CHANNEL_DESCRIPTION
                channel.enableVibration(true)
                channel.enableLights(true)
                channel.setShowBadge(true)

                manager.createNotificationChannel(channel)

                Log.d(
                    TAG,
                    "Notification channel created"
                )
            }
        }
    }

    private fun downloadImage(
        imageUrl: String
    ): Bitmap? {
        var connection: HttpURLConnection? = null

        return try {
            Log.d(TAG, "IMAGE URL = $imageUrl")

            val url = URL(imageUrl)

            connection =
                url.openConnection() as HttpURLConnection

            connection.requestMethod = "GET"
            connection.connectTimeout = 15000
            connection.readTimeout = 15000
            connection.instanceFollowRedirects = true
            connection.doInput = true

            connection.setRequestProperty(
                "User-Agent",
                "Workkerz-Android"
            )

            Log.d(TAG, "Connecting to image...")

            connection.connect()

            val responseCode =
                connection.responseCode

            Log.d(
                TAG,
                "IMAGE HTTP CODE = $responseCode"
            )

            if (responseCode !in 200..299) {
                Log.e(
                    TAG,
                    "Image HTTP error: $responseCode"
                )
                return null
            }

            val contentType =
                connection.contentType

            Log.d(
                TAG,
                "IMAGE CONTENT TYPE = $contentType"
            )

            connection.inputStream.use { inputStream ->
                val result =
                    BitmapFactory.decodeStream(
                        inputStream
                    )

                if (result == null) {
                    Log.e(
                        TAG,
                        "BitmapFactory returned NULL"
                    )
                } else {
                    Log.d(
                        TAG,
                        "Bitmap decoded successfully"
                    )
                }

                result
            }
        } catch (exception: Exception) {
            Log.e(
                TAG,
                "IMAGE DOWNLOAD EXCEPTION",
                exception
            )

            null
        } finally {
            connection?.disconnect()
        }
    }
}
