import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SelfHelp, SelfHelpNavigation, SelfHelpPageRequest, LocalSelfhelp, Styles, ConfirmAlert, LoginValues, RegistrationValues } from './../selfhelpInterfaces';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { StringUtils } from 'turbocommons-ts';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Device } from '@ionic-native/device/ngx';
import { NotificationsService } from './notifications.service';
import { HiddenPageComponent } from '../components/hidden-page/hidden-page.component';

@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private isApp: boolean = false;
    private local_selfhelp: LocalSelfhelp = 'selfhelp';
    private API_ENDPOINT_NATIVE = 'http://178.38.58.178/selfhelp';
    private API_ENDPOINT_WEB = 'http://localhost/selfhelp';
    private API_LOGIN = '/login';
    private HOME = '/home';
    private selfhelp: BehaviorSubject<SelfHelp> = new BehaviorSubject<SelfHelp>({
        navigation: [],
        selectedMenu: null,
        selectedSubMenu: null,
        urls: {},
        logged_in: null,
        base_path: '',
        current_url: '/'
    });
    private initApp = false;
    private messageDuration = 2000;    

    constructor(
        private http: HttpClient,
        private httpN: HTTP,
        private platform: Platform,
        private storage: Storage,
        private toastController: ToastController,
        private alertController: AlertController,
        private router: Router,
        private inAppBrowser: InAppBrowser,
        private modalController: ModalController,
        private device: Device,
        private notificationsService: NotificationsService
    ) {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.isApp = true;
            } else {
                this.isApp = false;
            }
            this.getLocalSelfhelp();
            this.getPage(this.HOME);
        });
    }

    /**
     * @description Return observable for SelfHelp page, it will be used to detect changes
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @returns {Observable<SelfHelp>}
     * @memberof SelfhelpService
     */
    public observeSelfhelp(): Observable<SelfHelp> {
        return this.selfhelp.asObservable();
    }

    /**
     * @description Is code running on app or browser
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @returns {boolean}
     * @memberof SelfhelpService
     */
    public getIsApp(): boolean {
        return this.isApp;
    }

    /**
     * @description Execute server request
     * @author Stefan Kodzhabashev
     * @date 2020-12-29
     * @public
     * @param {string} keyword
     * @param {*} params
     * @returns {Promise<SelfHelpPageRequest>}
     * @memberof SelfhelpService
     */
    public async execServerRequest(keyword: string, params: any): Promise<SelfHelpPageRequest> {
        if (!params['mobile']) {
            params['mobile'] = true;
        }
        params['device_id'] = this.getDeviceID();
        if (this.getIsApp()) {
            // use native calls
            params['device_token'] = await this.notificationsService.getToken();
            return new Promise((resolve, reject) => {
                this.httpN.setDataSerializer('utf8');
                this.httpN
                    .post(this.API_ENDPOINT_NATIVE + keyword, this.getNativeParams(params), { 'Content-Type': 'application/x-www-form-urlencoded' })
                    .then(
                        response => {
                            try {
                                resolve(JSON.parse(response.data));
                            } catch (error) {
                                reject(error);
                            }
                        },
                        error => {
                            console.log(keyword, error);
                            reject(error);
                        }
                    )
                    .catch((err) => {
                        reject(err);
                    });
            });
        } else {
            //use http requests
            const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            return new Promise((resolve, reject) => {
                this.http.post(this.API_ENDPOINT_WEB + keyword, this.getPostParams(params), { headers, withCredentials: true })
                    .toPromise()
                    .then(res => {
                        resolve(res as SelfHelpPageRequest);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err); // Here.
                    });
            });
        }
    }

    /**
     * @description Format object to post  params for browser request
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {*} value
     * @returns {string}
     * @memberof SelfhelpService
     */
    private getPostParams(value: any): HttpParams {
        let s = [];

        let add = (k: string, v: any) => {
            v = typeof v === 'function' ? v() : v;
            v = v === null ? '' : v === undefined ? '' : v;
            s.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        };

        let buildParams = (prefix: string, obj: any) => {
            if (prefix) {
                if (Array.isArray(obj)) {
                    obj.forEach((v, i) => buildParams(prefix + '[' + (typeof v === 'object' && v ? i : '') + ']', v));
                } else if (String(obj) === '[object Object]') {
                    Object.keys(obj)
                        .forEach(key => buildParams(prefix + '[' + key + ']', obj[key]));
                } else {
                    add(prefix, obj);
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(v => add(v.name, v.value));
            } else {
                Object.keys(obj)
                    .forEach(key => buildParams(key, obj[key]));
            }
            return s;
        };

        let params = buildParams(null, value).join('&');

        return new HttpParams({ fromString: params });
    }

    public setPage(url: string, page: SelfHelpPageRequest): void {
        if (page.navigation) {
            this.setNavigation(page.navigation);
        }
        let urlFound = false;
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.current_url = url;
        for (let i = 0; i < currSelfhelp.navigation.length; i++) {
            const nav = currSelfhelp.navigation[i];
            if (this.getUrl(nav) == url) {
                urlFound = true;
                if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url], page.content)) {
                    // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                    currSelfhelp.urls[url] = page.content;
                    this.setSelfhelp(currSelfhelp, true);
                }
                break;
            } else {
                for (let j = 0; j < nav.children.length; j++) {
                    const subNav = nav.children[j];
                    if (this.getUrl(subNav) == url) {
                        urlFound = true;
                        if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url], page.content)) {
                            // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                            currSelfhelp.urls[url] = page.content;
                            this.setSelfhelp(currSelfhelp, true);
                        }
                        break;
                    }
                }
            }
        }
        if (!urlFound) {
            if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url], page.content)) {
                // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                currSelfhelp.urls[url] = page.content;
                this.setSelfhelp(currSelfhelp, true);
            }
        }
        if (this.selfhelp.value.logged_in != page.logged_in) {
            // check for login change
            let newSelfhelp = this.selfhelp.value;
            newSelfhelp.logged_in = page.logged_in;
            newSelfhelp.base_path = page.base_path;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (!page.logged_in && url != "/login") {
            this.autoLogin();
        }
        this.setSelfhelp(currSelfhelp, true);
    }

    private autoLogin() {
        console.log('try auto login');
        if (this.selfhelp.value.credentials) {
            this.login(this.selfhelp.value.credentials, "Failed Auto Login!");
        }
    }

    public login(loginValues: LoginValues, alert_fail: string): Promise<boolean> {
        let data = loginValues;
        data['type'] = 'login';
        return this.execServerRequest(this.API_LOGIN, data)
            .then((res: SelfHelpPageRequest) => {
                let currSelfhelp = this.selfhelp.value;
                if (currSelfhelp.logged_in != res.logged_in) {
                    currSelfhelp.logged_in = res.logged_in;
                    this.setSelfhelp(currSelfhelp, true);
                    this.getPage('/tab');
                    this.setNav(this.selfhelp.value.current_url);
                }
                if (!res.logged_in && alert_fail) {
                    this.presentToast(alert_fail, 'danger');
                    return false;
                }
                this.saveCredentials(loginValues);
                return true;
            })
            .catch((err) => {
                console.log(err);
                return false;
            });
    }

    private saveCredentials(loginValues: LoginValues) {
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.credentials = loginValues;
        this.setSelfhelp(currSelfhelp, true);
    }

    public register(regValues: RegistrationValues): Promise<boolean> {
        let data = regValues;
        data['type'] = 'register';
        return this.execServerRequest(this.API_LOGIN, data)
            .then((res: SelfHelpPageRequest) => {
                let currSelfhelp = this.selfhelp.value;
                const result = this.output_messages(res.content);
                if (currSelfhelp.logged_in != res.logged_in) {
                    currSelfhelp.logged_in = res.logged_in;
                    this.setSelfhelp(currSelfhelp, true);
                    this.getPage('/tab');
                    this.setNav(this.selfhelp.value.current_url);
                }
                return result;
            })
            .catch((err) => {
                console.log(err);
                return false;
            });
    }

    public setNavigation(selfHelpNavigation: SelfHelpNavigation[]): void {
        if (!this.isEqual(selfHelpNavigation, this.selfhelp.value.navigation)) {
            console.log('setNavigation', selfHelpNavigation);
            let currSelfhelp = this.selfhelp.value;
            currSelfhelp.navigation = selfHelpNavigation;
            this.setSelfhelp(currSelfhelp, true);
            if (!this.initApp) {
                this.initApp = true;
                console.log('Init the app - take all menues');
                this.initAllMenuContent();
            }
        }
    }

    public getUrl(nav: SelfHelpNavigation): string {
        return nav.children.length > 0 ? nav.children[0].url : nav.url;
    }

    private initAllMenuContent(): void {
        let currSelfhelp = this.selfhelp.value;
        for (let i = 0; i < currSelfhelp.navigation.length; i++) {
            const nav = currSelfhelp.navigation[i];
            if (nav.url) {
                this.getPage(this.getUrl(nav));
                if (nav.children.length > 0) {
                    // first url is same as parent main url
                    for (let j = 1; j < nav.children.length; j++) {
                        this.getPage(this.getUrl(nav.children[j]));
                    }
                }
            }
        }
    }

    private setSelfhelp(selfhelp: SelfHelp, contentChange: boolean): void {
        if (contentChange) {
            this.saveLocalSelfhelp();
        }
        this.selfhelp.next(selfhelp);
    }

    public setSelectedMenu(nav: SelfHelpNavigation): void {
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.selectedMenu = nav;
        this.setSelfhelp(currSelfhelp, false);
    }

    public setSelectedSubMenu(nav: SelfHelpNavigation): void {
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.selectedSubMenu = nav;
        this.setSelfhelp(currSelfhelp, false);
    }

    public getPage(keyword: string): void {
        this.execServerRequest(keyword, {})
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    console.log(res);
                    this.setPage(keyword, res);
                }
            })
            .catch((err) => {
                console.log(keyword, err);
            });
    }

    public isEqual(obj1: any, obj2: any): boolean {
        const o1 = JSON.stringify(obj1);
        const o2 = JSON.stringify(obj2);
        const res = o1 == o2;
        if (!res) {
            console.log('change');
        }
        return res;
    }

    public getContent(nav: SelfHelpNavigation) {
        return this.selfhelp.value.urls[this.getUrl(nav)];
    }

    private getLocalSelfhelp() {
        this.storage.get(this.local_selfhelp).then((val) => {
            if (val) {
                this.setSelfhelp(JSON.parse(val), false);
            }
        });
    }

    private saveLocalSelfhelp() {
        this.storage.set(this.local_selfhelp, JSON.stringify(this.selfhelp.value));
    }

    public submitForm(keyword: string, params: any) {
        this.execServerRequest(keyword, params)
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    this.output_messages(res.content);
                    this.setPage(keyword, res);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    private output_messages(content: Styles): boolean {
        let res = true;
        content.forEach(style => {
            if (style.success_msgs) {
                style.success_msgs.forEach(success_msg => {
                    this.presentToast(success_msg, 'success');
                });
            }
            if (style.fail_msgs) {
                console.log(style.fail_msgs);
                res = false;
                style.fail_msgs.forEach(fail_msg => {
                    this.presentToast(fail_msg, 'danger');
                });
            }
            res = res && this.output_messages(style.children);
        });
        return res;
    }

    private getNativeParams(params): string {
        var prefix, s, add, name, r20, output;
        s = [];
        r20 = /%20/g;
        add = function (key, value) {
            // If value is a function, invoke it and return its value
            value = (typeof value == 'function') ? value() : (value == null ? "" : value);
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
        if (params instanceof Array) {
            for (name in params) {
                add(name, params[name]);
            }
        } else {
            for (prefix in params) {
                this.buildParams(prefix, params[prefix], add);
            }
        }
        output = s.join("&").replace(r20, "+");
        return output;
    };

    private buildParams(prefix, obj, add): void {
        var name, i, l, rbracket;
        rbracket = /\[\]$/;
        if (obj instanceof Array) {
            for (i = 0, l = obj.length; i < l; i++) {
                if (rbracket.test(prefix)) {
                    add(prefix, obj[i]);
                } else {
                    this.buildParams(prefix + "[" + (typeof obj[i] === "object" ? i : "") + "]", obj[i], add);
                }
            }
        } else if (typeof obj == "object") {
            // Serialize object item.
            for (name in obj) {
                this.buildParams(prefix + "[" + name + "]", obj[name], add);
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    async presentToast(msg: string, color: string) {
        const toast = await this.toastController.create({
            message: msg,
            position: 'top',
            color: color,
            duration: this.messageDuration
        });
        toast.present();
    }

    public getApiEndPointNative(): string {
        return this.API_ENDPOINT_NATIVE;
    }

    public async presentAlertConfirm(options: ConfirmAlert) {
        const alert = await this.alertController.create({
            cssClass: '',
            header: options.header ? options.header : "Selfhelp",
            message: options.msg,
            backdropDismiss: options.backdropDismiss,
            buttons: [
                {
                    text: options.cancelLabel ? options.cancelLabel : 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {

                    }
                }, {
                    text: options.confirmLabel ? options.confirmLabel : 'Okay',
                    handler: () => {
                        if (options.callback) {
                            options.callback();
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    public getBasePath(): string {
        return this.selfhelp.value.base_path;
    }

    public setNav(url: string): boolean {
        const currSelfhelp = this.selfhelp.value;
        for (let i = 0; i < currSelfhelp.navigation.length; i++) {
            const nav = currSelfhelp.navigation[i];
            if (nav.url == url) {
                this.router.navigate([this.getUrl(nav)]);
                currSelfhelp.selectedMenu = nav;
                this.setSelfhelp(currSelfhelp, false);
                return true;
            } else {
                for (let j = 0; j < nav.children.length; j++) {
                    const subNav = nav.children[j];
                    if (subNav.url == url) {
                        this.router.navigate([this.getUrl(nav)]);
                        currSelfhelp.selectedMenu = nav;
                        currSelfhelp.selectedSubMenu = subNav;
                        this.setSelfhelp(currSelfhelp, false);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public openUrl(url: string): boolean {
        if (this.selfhelp.value.urls[url]) {

            // 
            this.getPage(url);
            if (!this.setNav(url)) {
                console.log('url not found');
                this.showHiddenPage(url);
            }
            // this.setSelectedMenu(this.selfhelp.value.urls[url]);            
        } else if (StringUtils.isUrl(url)) {
            // it is web link, open in the browser
            console.log('open browser');
            const browser = this.inAppBrowser.create(url);
        } else {
            console.log('url not found');
            this.showHiddenPage(url);
        }
        return true;
    }

    private async showHiddenPage(url: string) {
        const modal = await this.modalController.create({
            component: HiddenPageComponent,
            componentProps: {
                url_param: url
            },
            swipeToClose: true,
            backdropDismiss: true,
            showBackdrop: true,
            cssClass: ''
        });
        return await modal.present();
    }

    public async closeModal() {
        await this.modalController.dismiss(null, undefined);
    }

    public logout(): void {
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.credentials = null;
        this.setSelfhelp(currSelfhelp, true);
        this.getPage('/login');
    }

    public getDeviceID(): string {
        return this.device.uuid;
    }

}
