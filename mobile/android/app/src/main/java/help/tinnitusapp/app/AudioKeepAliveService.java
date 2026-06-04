package help.tinnitusapp.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

/**
 * AURALIS — Foreground service за ЗАКЛЮЧЕН ЕКРАН (Capacitor Фаза 2).
 *
 * ПРОБЛЕМ (виж AURALIS_MASTER_2026-06-02.md §1): на заключен екран Android
 * suspend-ва процеса за пестене на батерия → Web Audio спира след ~5 мин.
 * PWA-кръпката (media-session.js) е best-effort; това е истинското решение:
 * foreground service с постоянна нотификация държи процеса жив, точно както
 * музикалните приложения, така че WebView аудиото продължава при заключен екран.
 *
 * Service-ът не свири нищо сам — звукът идва от WebView (Web Audio). Той само
 * пречи на OS да убие/suspend-не процеса. Стартира се от ForegroundAudioPlugin,
 * задвижван от auralis-session-start/end (js/capacitor-native.js).
 */
public class AudioKeepAliveService extends Service {

    public static final String CHANNEL_ID = "auralis_playback";
    public static final int NOTIF_ID = 8421;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createChannel();
        Notification notif = buildNotification();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10+ изисква foregroundServiceType при стартиране.
                startForeground(NOTIF_ID, notif, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIF_ID, notif);
            }
        } catch (Exception e) {
            // Last resort — опитай без тип (по-стари устройства / неочаквани случаи).
            try {
                startForeground(NOTIF_ID, notif);
            } catch (Exception ignored) {
                // Ако и това гръмне, не сме foreground, но НЕ крашваме app-а.
            }
        }

        // START_STICKY: ако OS убие service-а, опитва да го рестартира.
        return START_STICKY;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(
                        CHANNEL_ID,
                        "Възпроизвеждане",
                        NotificationManager.IMPORTANCE_LOW   // тих, без звук/вибрация
                );
                ch.setDescription("Държи звука активен при заключен екран");
                ch.setShowBadge(false);
                ch.setSound(null, null);
                nm.createNotificationChannel(ch);
            }
        }
    }

    private Notification buildNotification() {
        // Tap на нотификацията → връща в приложението.
        Intent launch = new Intent(this, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getActivity(this, 0, launch, piFlags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("AURALIS")
                .setContentText("Звукова терапия се възпроизвежда")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pi)
                .setOngoing(true)
                .setSilent(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();
    }
}
