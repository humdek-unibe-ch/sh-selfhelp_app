import { Injectable, Injector } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { SelfhelpService } from './selfhelp.service';
import { UtilsService } from './utils.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    constructor(private firebaseX: FirebaseX, private utils: UtilsService, private platform: Platform, public toastController: ToastController, private injector: Injector) { }

    public initFirebaseX() {
        this.firebaseX.hasPermission().then((res) => {
            if (res) {
                this.onNotification();
            } else {
                this.utils.debugLog('Ask for push notiification permisisions', null);
                this.firebaseX.grantPermission().then((res) => {
                    if (res) {
                        this.onNotification();
                    } else {
                        this.utils.debugLog('Push notification permisisons were not granted', null);
                    }
                })
            }
        });
    }

    public getToken(): Promise<string> {
        return this.firebaseX.getToken().then(token => {
            return token;
        });

    }

    private onNotification() {
        this.utils.debugLog('Set up event on push notification recieved', null);
        this.firebaseX.onMessageReceived().subscribe((data: any) => {
            this.utils.debugLog('Push notification recieved ', data);
            this.showNotification(data);
            if(data['url']){
                const selfhelpService = this.injector.get(SelfhelpService);
                setTimeout(() => {
                    selfhelpService.openUrl(data['url']); 
                }, 1000);                
            }
        });
    }

    private async showNotification(data: any) {
        // show the notification if the app is open
        let message = '';
        if (this.platform.is('ios')) {
            message = data.aps.alert.body;
        } else {
            message = data['body'];
        }
        if (message && message != " ") {
            const toast = await this.toastController.create({
                message,
                duration: 10000,
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
