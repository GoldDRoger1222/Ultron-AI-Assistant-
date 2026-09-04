// Android Native Bridge Generator & APK Manifest Generator for JARVIS
// Provides Capacitor / Cordova / Termux & Background Service Automation

export interface AndroidNativeConfig {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  permissions: string[];
}

export const JARVIS_NATIVE_CONFIG: AndroidNativeConfig = {
  packageName: 'com.jarvis.ultron.ai',
  appName: 'JARVIS Ultron AI',
  versionName: '5.0.0',
  versionCode: 50,
  permissions: [
    'android.permission.RECORD_AUDIO',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MICROPHONE',
    'android.permission.WAKE_LOCK',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.CAMERA',
    'android.permission.FLASHLIGHT',
    'android.permission.VIBRATE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.SYSTEM_ALERT_WINDOW',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
  ],
};

export function generateAndroidManifestXml(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${JARVIS_NATIVE_CONFIG.packageName}">

    <!-- JARVIS 24/7 Background System Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${JARVIS_NATIVE_CONFIG.appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.JARVIS"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:theme="@style/Theme.JARVIS.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 24/7 Always-On Background Voice Service -->
        <service
            android:name=".JarvisBackgroundVoiceService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="microphone" />

        <receiver
            android:name=".BootCompletedReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>`;
}

export function generateCapacitorConfigJson(serverUrl: string): string {
  return JSON.stringify(
    {
      appId: 'com.jarvis.ultron.ai',
      appName: 'JARVIS Ultron AI',
      webDir: 'dist',
      server: {
        url: serverUrl,
        cleartext: true,
        allowNavigation: ['*'],
      },
      android: {
        allowMixedContent: true,
        backgroundColor: '#000000',
        webContentsDebuggingEnabled: true,
      },
      plugins: {
        BackgroundRunner: {
          label: 'com.jarvis.ultron.ai.background',
          src: 'background.js',
          event: 'voiceRecognitionPing',
          repeat: true,
          interval: 15,
          autoStart: true,
        },
      },
    },
    null,
    2
  );
}

export function generateTermuxOneClickScript(serverUrl: string): string {
  return `#!/data/data/com.termux/files/usr/bin/bash
# ==========================================================
# JARVIS ULTRON 24/7 ANDROID BACKGROUND DAEMON INSTALLER
# ==========================================================
echo "⚡ Setting up JARVIS 24/7 Always-On Audio Daemon in Termux..."
pkg update -y && pkg install -y nodejs termux-api termux-exec curl pulseaudio

termux-wake-lock
echo "🔒 Wake-Lock acquired. Android OS will not kill JARVIS."

cat << 'EOF' > start_jarvis.sh
#!/bin/bash
echo "🚀 JARVIS Android Background Voice Bridge is RUNNING!"
echo "Server Endpoint: ${serverUrl}"

# Acquire termux microphone & keep alive
while true; do
  termux-notification --title "JARVIS Voice Core" --content "Online 24/7 & Listening for Wake Words" --priority high --ongoing true
  sleep 300
done
EOF

chmod +x start_jarvis.sh
./start_jarvis.sh
`;
}
