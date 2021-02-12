import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SelfHelp, SelfHelpNavigation, SelfHelpPageRequest, LocalSelfhelp, Styles, ConfirmAlert, LoginValues, RegistrationValues, ResetPasswordValues, ValidateValues } from './../selfhelpInterfaces';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { StringUtils } from 'turbocommons-ts';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Device } from '@ionic-native/device/ngx';
import { NotificationsService } from './notifications.service';
import { ModalPageComponent } from '../components/modal-page/modal-page.component';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { version } from '../../../package.json';

@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private isApp: boolean = false;
    private local_selfhelp: LocalSelfhelp = 'selfhelp';
    // private API_ENDPOINT_NATIVE = 'http://178.38.58.178/selfhelp';
    private API_ENDPOINT_NATIVE = 'https://becccs.psy.unibe.ch';
    private API_ENDPOINT_WEB = 'http://localhost/selfhelp';
    public API_LOGIN = '/login';
    private API_RESET = '/reset';
    public API_HOME = '/home';
    private selfhelp: BehaviorSubject<SelfHelp> = new BehaviorSubject<SelfHelp>({
        navigation: [],
        selectedMenu: null,
        selectedSubMenu: null,
        urls: {},
        logged_in: null,
        base_path: '',
        current_url: '/',
        current_modal_url: ''
    });
    private initApp = false;
    private messageDuration = 10000;
    public appVersion: string;
    public appBuildVersion: string;

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
        private notificationsService: NotificationsService,
        private appVersionPlugin: AppVersion
    ) {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.isApp = true;
            } else {
                this.isApp = false;
            }
            this.appVersionPlugin.getVersionNumber().then((res) => {
                this.appVersion = res;
            });
            this.appBuildVersion = version;
            this.getLocalSelfhelp();
            console.log('selfehlp service loaded', this.selfhelp.value.current_modal_url);
            this.getPage(this.API_HOME);
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
                if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url].content, page.content)) {
                    // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                    currSelfhelp.urls[url] = {
                        content: page.content,
                        title: page.title
                    };
                    this.setSelfhelp(currSelfhelp, true);
                }
                break;
            } else {
                for (let j = 0; j < nav.children.length; j++) {
                    const subNav = nav.children[j];
                    if (this.getUrl(subNav) == url) {
                        urlFound = true;
                        if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url].content, page.content)) {
                            // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                            currSelfhelp.urls[url] = {
                                content: page.content,
                                title: page.title
                            };
                            this.setSelfhelp(currSelfhelp, true);
                        }
                        break;
                    }
                }
            }
        }
        if (!urlFound) {
            if (!currSelfhelp.urls[url] || !this.isEqual(currSelfhelp.urls[url].content, page.content)) {
                // if url is not in menues and it is not in external ursl we assign it. If it is in the urls but changed update too
                currSelfhelp.urls[url] = {
                    content: page.content,
                    title: page.title
                };
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
        if (!page.logged_in && url != this.API_LOGIN && !url.includes('/validate') && !url.includes(this.API_RESET)) {
            this.autoLogin();
        }
        this.setSelfhelp(currSelfhelp, true);
    }

    private async autoLogin() {
        console.log('try auto login');
        if (this.selfhelp.value.credentials) {
            const loginRes = await this.login(this.selfhelp.value.credentials, "Failed Auto Login!");
            if (!loginRes) {
                console.log('Login failed', this.selfhelp.value.current_url);
                this.openUrl(this.API_LOGIN);
            }
        } else {
            console.log('Show login', this.selfhelp.value.current_url);
            this.openUrl(this.API_LOGIN);
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
                    this.getPage(currSelfhelp.navigation[0].url);
                    this.setNav(currSelfhelp.navigation[0].url);
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
                    this.getPage(currSelfhelp.navigation[0].url);
                    this.setNav(currSelfhelp.navigation[0].url);
                }
                return result;
            })
            .catch((err) => {
                console.log(err);
                return false;
            });
    }

    public validate(validateValues: ValidateValues, url: string): Promise<boolean> {
        return this.execServerRequest(url, validateValues)
            .then((res: SelfHelpPageRequest) => {
                const result = this.output_messages(res.content);
                return result;
            })
            .catch((err) => {
                console.log(err);
                return false;
            });
    }

    public resetPassword(resetValues: ResetPasswordValues): Promise<boolean> {
        let data = resetValues;
        return this.execServerRequest(this.API_RESET, data)
            .then((res: SelfHelpPageRequest) => {
                return this.output_messages(res.content);
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
                // console.log('Init the app - take all menues');
                // this.initAllMenuContent();
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

    public getPage(keyword: string): Promise<SelfHelpPageRequest> {
        return new Promise((resolve, reject) => {
            this.execServerRequest(keyword, {})
                .then((res: SelfHelpPageRequest) => {
                    if (res) {
                        console.log(keyword, 'getPage', res);
                        this.setPage(keyword, res);
                        resolve(res);
                    }
                })
                .catch((err) => {
                    console.log(keyword, err);
                    reject(err);
                });
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
        return this.selfhelp.value.urls[this.getUrl(nav)] ? this.selfhelp.value.urls[this.getUrl(nav)].content : null;
    }

    private getLocalSelfhelp() {
        this.storage.get(this.local_selfhelp).then((val) => {
            if (val) {
                let currSelfhelp = <SelfHelp>JSON.parse(val);
                currSelfhelp.current_modal_url = '';
                this.setSelfhelp(currSelfhelp, false);
            }
        });
    }

    private saveLocalSelfhelp() {
        this.storage.set(this.local_selfhelp, JSON.stringify(this.selfhelp.value));
    }

    public submitForm(keyword: string, params: any): Promise<boolean> {
        return this.execServerRequest(keyword, params)
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    if (!this.output_messages(res.content)) {
                        return false;
                    };
                    console.log(res);
                    this.setPage(keyword, res);
                }
                return true;
            })
            .catch((err) => {
                console.log(err);
                return false;
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
            duration: this.messageDuration,
            buttons: [
                {
                    text: "close",
                    handler: () => {
                        console.log('Close clicked');
                    }
                }
            ]
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
        console.log('open url', url, this.selfhelp.value.current_url);
        if (this.selfhelp.value.urls[url]) {

            // 
            this.getPage(url);
            if (!this.setNav(url)) {
                console.log('url not found');
                this.getModalPage(url);
            }
            // this.setSelectedMenu(this.selfhelp.value.urls[url]);            
        } else if (StringUtils.isUrl(url)) {
            // it is web link, open in the browser
            console.log('open browser');
            const browser = this.inAppBrowser.create(url);
        } else {
            console.log('url not found');
            this.getModalPage(url);
        }
        return true;
    }

    private async getModalPage(url: string) {
        console.log(url, 'modal url', this.selfhelp.value.current_modal_url);
        if (this.selfhelp.value.current_modal_url != url) {
            let curSelfhelp = this.selfhelp.value;
            curSelfhelp.current_modal_url = url;
            console.log('setModalUrl', url, this.selfhelp.value.current_modal_url);
            this.setSelfhelp(curSelfhelp, false);
            const modal = await this.modalController.create({
                component: ModalPageComponent,
                componentProps: {
                    url_param: url
                },
                swipeToClose: true,
                backdropDismiss: true,
                showBackdrop: true,
                cssClass: 'modal-fullscreen'
            });
            return await modal.present();
        } else {
            return null;
        }
    }

    public async closeModal() {
        let curSelfhelp = this.selfhelp.value;
        curSelfhelp.current_modal_url = '';
        this.setSelfhelp(curSelfhelp, false);
        await this.modalController.dismiss(null, undefined);
    }

    public async logout() {
        let currSelfhelp = this.selfhelp.value;
        currSelfhelp.credentials = null;
        this.setSelfhelp(currSelfhelp, true);
        await this.getPage(this.API_LOGIN);
        this.getPage(currSelfhelp.navigation[0].url); // set first tab on logout
    }

    public getDeviceID(): string {
        return this.device.uuid;
    }

    public async getModalComponent(component: any) {
        const modal = await this.modalController.create({
            component: component,
            swipeToClose: true,
            backdropDismiss: true,
            showBackdrop: true,
            cssClass: 'modal-fullscreen'
        });
        return await modal.present();
    }

}
