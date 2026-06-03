package help.tinnitusapp.app;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * AURALIS — Capacitor plugin: старт/стоп на foreground keep-alive service-а.
 *
 * Извиква се от js/capacitor-native.js при auralis-session-start/end.
 * JS достъп: Capacitor.Plugins.ForegroundAudio.start() / .stop()
 *
 * Регистриран в MainActivity.onCreate чрез registerPlugin(...).
 */
@CapacitorPlugin(name = "ForegroundAudio")
public class ForegroundAudioPlugin extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        try {
            Intent svc = new Intent(getContext(), AudioKeepAliveService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(svc);
            } else {
                getContext().startService(svc);
            }
            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("foreground service start failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            Intent svc = new Intent(getContext(), AudioKeepAliveService.class);
            getContext().stopService(svc);
            JSObject ret = new JSObject();
            ret.put("stopped", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("foreground service stop failed: " + e.getMessage());
        }
    }
}
