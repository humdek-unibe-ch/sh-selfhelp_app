import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'unibe.tpf.selfhelp_dev',
    appName: 'SelfHelp',
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
        },
        CodePush: {
            IOS_DEPLOY_KEY: "IOS_DEPLOYMENT_KEY",
            ANDROID_DEPLOY_KEY: "TLt7woDy4QrIzXiyl9epcE6e3s9HNifjcUAvv",
            SERVER_URL: "https://codepush.appcenter.ms/"
        }
    }
};

export default config;
