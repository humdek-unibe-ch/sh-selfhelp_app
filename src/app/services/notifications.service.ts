import { Injectable, Injector } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { SelfhelpService } from './selfhelp.service';
import { UtilsService } from './utils.service';
import { Preferences } from '@capacitor/preferences';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    private token?: string;
    private tokenResolve?: (value: string) => void;
    private tokenPromise: Promise<string>;
    private static readonly TOKEN_STORAGE_KEY = 'sh_push_device_token';

    constructor(private utils: UtilsService, private platform: Platform, public toastController: ToastController, private injector: Injector) {
        this.tokenPromise = new Promise<string>((resolve) => {
            this.tokenResolve = resolve;
        });
        this.loadPersistedToken();
    }

    private async loadPersistedToken() {
        try {
            const stored = await Preferences.get({ key: NotificationsService.TOKEN_STORAGE_KEY });
            if (stored.value && !this.token) {
                this.token = stored.value;
                this.tokenResolve?.(stored.value);
                this.utils.debugLog('Loaded persisted push token', stored.value);
            }
        } catch { /* ignore */ }
    }

    private setToken(value: string) {
        if (!value) return;
        this.token = value;
        this.tokenResolve?.(value);
        Preferences.set({ key: NotificationsService.TOKEN_STORAGE_KEY, value }).catch(() => {});
    }

    public async initPushNotifications() {
        PushNotifications.addListener('registration',
            (token: Token) => {
                this.utils.debugLog('Registration successful', token);
                this.setToken(token.value);
            }
        );

        PushNotifications.addListener('registrationError',
            (error: any) => {
                this.utils.debugLog('Error on registration', error);
            }
        );

        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
            PushNotifications.register();
        } else {
            this.utils.debugLog('Push permission not granted', null);
        }

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived',
            async (notification: PushNotificationSchema) => {
                this.utils.debugLog('Push notification received', notification);
                this.showNotification(notification);
                if (notification.data['url']) {
                    const selfhelpService = this.injector.get(SelfhelpService);
                    await selfhelpService.getLocalSelfhelp();
                    selfhelpService.openUrl(notification.data['url']);
                }
            }
        );

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed',
            async (notificationAction: ActionPerformed) => {
                this.utils.debugLog('Push action performed', notificationAction);
                this.showNotification(notificationAction.notification);
                if (notificationAction.notification.data['url']) {
                    const selfhelpService = this.injector.get(SelfhelpService);
                    await selfhelpService.getLocalSelfhelp();
                    selfhelpService.openUrl(notificationAction.notification.data['url']);
                }
            }
        );
    }

    public getToken(): string {
        return this.token ? this.token : '';
    }

    public async waitForToken(timeoutMs: number = 5000): Promise<string> {
        if (this.token) return this.token;
        return Promise.race([
            this.tokenPromise,
            new Promise<string>((resolve) => setTimeout(() => resolve(this.token || ''), timeoutMs))
        ]);
    }

    private async showNotification(data: any) {
        // show the notification if the app is open
        let message = '';
        this.utils.debugLog('notifification data', data);
        if (this.platform.is('ios')) {
            message = data.data.aps.alert.body;
        } else {
            message = data['body'];
        }
        if (message && message != " ") {
            const toast = await this.toastController.create({
                message,
                duration: 30000,
                position: 'top',
                buttons: [
                    {
                        text: "close",
                        handler: () => {
                            // console.log('Close clicked');
                        }
                    }
                ]
            });
            toast.present();
        }
    }
}
