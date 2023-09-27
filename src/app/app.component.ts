import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NotificationsService } from './services/notifications.service';
import { SelfhelpService } from './services/selfhelp.service';
// import { CodePush } from '@ionic-native/code-push/ngx';
declare const IonicDeeplink: any;
import { register } from 'swiper/element/bundle';
register();

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {

    public skinIOS: boolean = true;

    constructor(
        private platform: Platform,
        private loadingCtrl: LoadingController,
        private notificationsService: NotificationsService,
        public selfhelpSerivce: SelfhelpService
        // private codePush: CodePush
    ) {
        if (window.localStorage.getItem('skin_app') && window.localStorage.getItem('skin_app') == 'md') {
            this.skinIOS = false;
        }
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(async () => {
            this.presentLoadingWithOptions();
            if (this.selfhelpSerivce.getIsApp()) {
                this.checkForUpdate();
                this.initDeepLinking();
                StatusBar.setStyle({ style: Style.Default });
                await SplashScreen.hide();
                this.notificationsService.initPushNotifications();
            }
        });
    }

    private async presentLoadingWithOptions() {
        console.log('navigator', window.name, navigator);
        const loading = await this.loadingCtrl.create({
            // message: '<ion-img src="/assets/loading.gif" alt="loading..."></ion-img>',
            message: '<div class="loader">Loading ' + window.name + '...</div>',
            cssClass: 'scale-down-center',
            translucent: true,
            showBackdrop: false,
            spinner: null,
            duration: 1000
        });
        await loading.present();
    }

    private checkForUpdate() {
        // const downloadProgress = (progress) => { console.log(`Downloaded ${progress.receivedBytes} of ${progress.totalBytes}`); }
        // this.codePush.sync({}, downloadProgress).subscribe((syncStatus) => console.log(syncStatus));
    }

    initDeepLinking() {
        // IonicDeeplink.onDeepLink((link) => {
        //     if (link['path']) {
        //         const pathArr = link.path.split('/');
        //         if (pathArr.length > 0 && pathArr.length == 4 && pathArr[1] == 'validate') {
        //             this.selfhelpSerivce.openUrl(link.path);
        //         }
        //     }
        // });
    }

    public skinChanged(event: any): void {
        this.selfhelpSerivce.skin_app = event.detail.checked ? "ios" : "md";
        window.localStorage.setItem('skin_app', this.selfhelpSerivce.skin_app);
        window.location.reload();
    }

    public getAppSkin(): string {
        let skin_app = window.localStorage.getItem('skin_app');
        if (!skin_app) {
            skin_app = 'ios';
        }
        return skin_app;
    }

    public resetPreview(): void {
        this.selfhelpSerivce.presentAlertConfirm({
            msg: 'Do you want to reset the selected SelfHelp instance?',
            header: "Reset",
            confirmLabel: "Reset",
            callback: () => {
                this.selfhelpSerivce.resetLocalData();
                window.location.reload();
            }
        });
    }
}
