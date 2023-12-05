import { CapacitorConfig } from '@capacitor/cli';

// default config
let config: CapacitorConfig;

switch (process.env['NODE_ENV']) {
    case 'habirupt':
        // the habirupt config
        config = {
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
        break;
    default:
        // the default one for selfhelp-dev
        config = {
            appId: 'unibe.tpf.selfhelp-dev',
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
                    IOS_DEPLOY_KEY: "cO7ZGiZpaU1MApJX93jGv0fYzWrjNHgZaiFC1",
                    ANDROID_DEPLOY_KEY: "TLt7woDy4QrIzXiyl9epcE6e3s9HNifjcUAvv",
                    SERVER_URL: "https://codepush.appcenter.ms/"
                }
            }
        };
        break;
}

export default config;
