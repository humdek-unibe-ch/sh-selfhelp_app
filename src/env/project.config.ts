import { CapacitorConfig } from '@capacitor/cli';
import { AppConfig } from 'src/app/selfhelpInterfaces';

let capacitor_config: CapacitorConfig = {
    appId: 'unibe.tpf.habirupt',
    appName: 'Habirupt',
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
            IOS_DEPLOY_KEY: "cO7ZGiZpaU1MApJX93jGv0fYzWrjNHgZaiFC1",
            ANDROID_DEPLOY_KEY: "TLt7woDy4QrIzXiyl9epcE6e3s9HNifjcUAvv",
            SERVER_URL: "https://codepush.appcenter.ms/"
        }
    }
};

let project_config: AppConfig = {
    capacitor_config: capacitor_config
}

export default project_config;
