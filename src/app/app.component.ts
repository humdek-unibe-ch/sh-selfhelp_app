import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { name } from '../../package.json';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { NotificationsService } from './services/notifications.service';
import { SelfhelpService } from './services/selfhelp.service';
import { CodePush } from '@ionic-native/code-push/ngx';
declare const IonicDeeplink: any;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private loadingCtrl: LoadingController,
        private androidFullScreen: AndroidFullScreen,
        private notificationsService: NotificationsService,
        private selfhelpSerivce: SelfhelpService,
        private codePush: CodePush
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.presentLoadingWithOptions();
            if (this.selfhelpSerivce.getIsApp()) {
                this.checkForUpdate();
                this.initDeepLinking();
                this.androidFullScreen.isImmersiveModeSupported()
                    .then(() => this.androidFullScreen.immersiveMode())
                    .catch(err => console.log(err));
                this.statusBar.styleDefault();
                this.splashScreen.hide();
                this.notificationsService.initFirebaseX();
            }
        });
    }

    private async presentLoadingWithOptions() {
        const loading = await this.loadingCtrl.create({
            // message: '<ion-img src="/assets/loading.gif" alt="loading..."></ion-img>',
            message: '<div class="loader">Loading ' + name + '...</div>',
            cssClass: 'scale-down-center',
            translucent: true,
            showBackdrop: false,
            spinner: null,
            duration: 1000
        });
        await loading.present();
    }

    private checkForUpdate() {
        const downloadProgress = (progress) => { console.log(`Downloaded ${progress.receivedBytes} of ${progress.totalBytes}`); }
        this.codePush.sync({}, downloadProgress).subscribe((syncStatus) => console.log(syncStatus));
    }

    initDeepLinking() {
        IonicDeeplink.onDeepLink((link) => {
            if (link['path']) {
                const pathArr = link.path.split('/');
                if (pathArr.length > 0 && pathArr.length == 4 && pathArr[1] == 'validate') {
                    this.selfhelpSerivce.openUrl(link.path);
                }
            }
        });
    }

}
