import { CapacitorConfig } from '@capacitor/cli';
import { AppConfig } from 'src/app/selfhelpInterfaces';

let capacitorConfig: CapacitorConfig = {
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
            ANDROID_DEPLOY_KEY: "5ONwaVaLVyKRo0E9eVDdaHb8u0pfwiHhXxjzA",
            SERVER_URL: "https://codepush.appcenter.ms/"
        }
    }
};

let appConfig: AppConfig = {
    capacitorConfig: capacitorConfig,
    server: "https://habirupt.psy.unibe.ch"
}

export default appConfig;
