import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'unibe.tpf.selfhelp_dev',
    appName: 'Selfhelp',
    webDir: 'www',
    server: {
        androidScheme: 'https',
        cleartext: true
    },
    plugins: {
        CapacitorHttp: {
            enabled: true,
        },
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"]
        }
    }
};

export default config;
