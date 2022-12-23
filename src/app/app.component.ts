import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, ElementRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { NotificationsService } from './services/notifications.service';
import { SelfhelpService } from './services/selfhelp.service';
import { CodePush } from '@ionic-native/code-push/ngx';
import { MobilePreviewComponent } from './mobile-preview/mobile-preview.component';
declare const IonicDeeplink: any;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements AfterViewInit {
    @ViewChild('responsiveWindow', { static: false }) ResponsiveWindow: ElementRef;
    doc: any;
    compRef: ComponentRef<MobilePreviewComponent> | undefined;

    protected skinIOS: boolean = true;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private loadingCtrl: LoadingController,
        private androidFullScreen: AndroidFullScreen,
        private notificationsService: NotificationsService,
        protected selfhelpSerivce: SelfhelpService,
        private codePush: CodePush,
        private vcRef: ViewContainerRef,
        private resolver: ComponentFactoryResolver,
        private VcRef: ViewContainerRef
    ) {
        if (window.localStorage.getItem('skin_app') && window.localStorage.getItem('skin_app') == 'md') {
            this.skinIOS = false;
        }
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

    public skinChanged(event): void {
        this.selfhelpSerivce.skin_app = event.detail.checked ? "ios" : "md";
        window.localStorage.setItem('skin_app', this.selfhelpSerivce.skin_app);
        window.location.reload();
    }

    public getAppSkin(): string {
        return this.selfhelpSerivce.skin_app;
    }

    ngAfterViewInit(): void {
        // this.createAndEmbedComponent();
        // this.doc = this.ResponsiveWindow?.nativeElement.contentDocument || this.ResponsiveWindow?.nativeElement.CompFrame.contentWindow;
        // this.createComponent();
    }

    private createComponent(): void {
        const compFactory = this.resolver.resolveComponentFactory(MobilePreviewComponent);
        this.compRef = this.VcRef.createComponent(compFactory);
        this.compRef.location.nativeElement.id = 'propertyDisplay';
        this.doc.body.appendChild(this.compRef.location.nativeElement);
    }

    private createAndEmbedComponent(): void {

        const componentFactory = this.resolver.resolveComponentFactory(MobilePreviewComponent);
        const componentInstance: ComponentRef<MobilePreviewComponent> = this.vcRef.createComponent(componentFactory);
        const frame = this.ResponsiveWindow.nativeElement.contentDocument ||
            this.ResponsiveWindow.nativeElement.contentWindow;

        const iframeStyles = document.createElement('link');

        iframeStyles.rel = 'stylesheet';
        iframeStyles.type = 'text/css';
        iframeStyles.href = 'nested_styles.css';

        console.log(iframeStyles);

        frame.head.appendChild(iframeStyles);
        console.log(componentInstance.location.nativeElement);
        frame.body.appendChild(componentInstance.location.nativeElement);

    }

}
