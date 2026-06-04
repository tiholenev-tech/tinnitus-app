package help.tinnitusapp.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Регистрирай локалния plugin ПРЕДИ super.onCreate (изискване на Capacitor).
        registerPlugin(ForegroundAudioPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
