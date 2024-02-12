import { Injectable, Injector } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { SelfhelpService } from './selfhelp.service';
import { UtilsService } from './utils.service';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    private token?: string;

    constructor(private utils: UtilsService, private platform: Platform, public toastController: ToastController, private injector: Injector) { }

    public initPushNotifications() {
        PushNotifications.requestPermissions().then((res) => {
            if (res.receive === 'granted') {
                // Register with Apple / Google to receive push via APNS/FCM
                PushNotifications.register();
            } else {
                this.utils.debugLog('Error while registering for push notifications', null);
            }
        });

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration',
            (token: Token) => {
                this.utils.debugLog('Registration successful', token);
                this.token = token.value;
            }
        );

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError',
            (error: any) => {
                this.utils.debugLog('Error on registration', error);
            }
        );

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
