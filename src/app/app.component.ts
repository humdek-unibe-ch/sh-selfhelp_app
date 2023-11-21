import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NotificationsService } from './services/notifications.service';
import { SelfhelpService } from './services/selfhelp.service';
import { InstallMode, codePush } from '@dwimcore/capacitor-codepush';
import { register } from 'swiper/element/bundle';
import { UtilsService } from './services/utils.service';
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
        public selfhelpSerivce: SelfhelpService,
        public utils: UtilsService
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
        if (!this.utils.getDebugMode()) {
            // sync only if it is not in debug mode
            if (this.selfhelpSerivce.getIsApp()) {
                codePush.sync({ updateDialog: false, installMode: InstallMode.IMMEDIATE });
            }
        }
    }

    initDeepLinking() {

        // WHEN ADDING DEEP LINK, WE CAN ADD AUTOFILL FOR THE PASSWORDS

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
        this.selfhelpSerivce.resetServerSelection();
    }
}
