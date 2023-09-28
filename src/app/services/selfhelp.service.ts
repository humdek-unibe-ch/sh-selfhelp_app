import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { SelfHelp, Language, SelfHelpNavigation, SelfHelpPageRequest, LocalSelfhelp, Styles, ConfirmAlert, LoginValues, RegistrationValues, ResetPasswordValues, ValidateValues, ValueItem, SkinApp, InputStyle, RadioStyle, SelectStyle, TextAreaStyle, RegistrationResult, ValidationResult, ResetPasswordResult } from './../selfhelpInterfaces';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
// import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Device } from '@capacitor/device';
import { NotificationsService } from './notifications.service';
import { ModalPageComponent } from '../components/modal-page/modal-page.component';
import version from '../../../package.json';
import { UtilsService } from './utils.service';
import { TranslateService } from '@ngx-translate/core';
// import { PdfViewerComponent } from '../components/pdf-viewer/pdf-viewer.component';
import packageJson from './../../../package.json'; // Replace with the actual path to your package.json file
const appVersion = packageJson.version;


@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private defaultAppLocale = 'de-CH';
    private isApp: boolean = true;
    public devApp: boolean = true; // change to false when we prepare a specific build
    private local_selfhelp: LocalSelfhelp = 'selfhelp';
    private selfhelp_server: string = 'server';
    // private API_ENDPOINT_NATIVE = 'http://46.126.153.11/selfhelp';
    // private API_ENDPOINT_NATIVE = 'https://becccs.psy.unibe.ch';
    public API_ENDPOINT_NATIVE = 'https://studybuddy.edu.unibe.ch';
    private API_ENDPOINT_WEB = 'http://localhost/selfhelp';
    private API_SERVER_SELECTION = 'https://tpf-test.humdek.unibe.ch/SelfHelpMobile/mobile_projects';
    // private API_SERVER_SELECTION = 'http://192.168.0.58/selfhelp/mobile_projects';
    public API_LOGIN = '/login';
    public API_RESET = '/reset';
    public API_HOME = '/home';
    public selfhelp: BehaviorSubject<SelfHelp> = new BehaviorSubject<SelfHelp>({
        navigation: [],
        urls: {},
        base_path: '',
        current_url: '/',
        current_modal_url: '',
        avatar: '',
        external_css: '',
        default_language_id: 2,
        user_language: 2
    });
    private initApp = false;
    private messageDuration = 10000;
    public appVersion!: string;
    public appBuildVersion!: string;
    private lastToastMsg = '';
    private autoLoginAtempts = 0;
    public skin_app: SkinApp = 'ios';

    constructor(
        private platform: Platform,
        private toastController: ToastController,
        private alertController: AlertController,
        private router: Router,
        // private inAppBrowser: InAppBrowser,
        private modalController: ModalController,
        private notificationsService: NotificationsService,
        private utils: UtilsService,
        private translate: TranslateService
    ) {
        this.platform.ready().then(async () => {
            if (this.platform.is('capacitor')) {
                this.isApp = true;
            } else {
                this.isApp = false;
            }
            if (this.isApp) {
                this.appVersion = appVersion;
            }
            this.appBuildVersion = version.version;
            // Preferences.remove({ key: this.selfhelp_server }); // enable for resetting the server when developing
            // Preferences.remove({ key: this.local_selfhelp }); // enable for resetting the server when developing
            if (this.devApp) {
                // give an option to select a server
                if (await this.getServer()) {
                    this.utils.debugLog('Server is selected - load local info and get home page', null);
                    this.loadApp();
                } else {
                    this.selectServer();
                }
            } else {
                // load the app
                this.loadApp();
            }
        });
    }

    public loadApp() {
        this.getLocalSelfhelp();
        this.getPage(this.API_HOME);
        // this.openUrl('/validate/24/2dfa5a96f81fdec67eff37a2f81825b6');

    }

    public getServer(): Promise<boolean> {
        return Preferences.get({ key: this.selfhelp_server }).then((val) => {
            if (val.value) {
                this.API_ENDPOINT_NATIVE = <string>val.value;
                return true;
            } else {
                this.utils.debugLog('No server is selected', null);
                return false;
            }
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
        params['id_languages'] = this.selfhelp.value.user_language ? this.selfhelp.value.user_language : this.selfhelp.value.default_language_id;
        params['device_id'] = this.isApp ? await this.getDeviceID() : "WEB";
        params['mobile_web'] = true;
        if (this.notificationsService.getToken() !== '') {
            params['device_token'] = this.notificationsService.getToken();
        }
        this.utils.debugLog('Exec params', params);
        const options: HttpOptions = {
            url: this.API_ENDPOINT_NATIVE + keyword,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: this.getNativeParams(params),
            webFetchExtra: {
                credentials: "include",
            }
        };
        return new Promise((resolve, reject) => {
            CapacitorHttp.post(options).then(response => {
                try {
                    resolve(JSON.parse(response.data));
                } catch (error) {
                    this.utils.debugLog('error', response.data);
                    reject(error);
                }
            })
                .catch((err) => {
                    console.log(err);
                    reject(err); // Here.
                });
        });
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
                    // if url is not in menu and it is not in external url we assign it. If it is in the urls but changed update too
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
                            // if url is not in menu and it is not in external url we assign it. If it is in the urls but changed update too
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
            newSelfhelp.avatar = page.avatar;
            newSelfhelp.external_css = page.external_css;
            newSelfhelp.languages = page.languages;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (this.selfhelp.value.avatar != page.avatar) {
            // check for login change
            let newSelfhelp = this.selfhelp.value;
            newSelfhelp.avatar = page.avatar;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (this.selfhelp.value.external_css != page.external_css) {
            // check for login change
            let newSelfhelp = this.selfhelp.value;
            newSelfhelp.external_css = page.external_css;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (this.selfhelp.value.languages != page.languages) {
            // check for login change
            let newSelfhelp = this.selfhelp.value;
            newSelfhelp.languages = page.languages;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (this.selfhelp.value.user_language != page.user_language) {
            // check for login change
            let newSelfhelp = this.selfhelp.value;
            newSelfhelp.user_language = page.user_language;
            this.setSelfhelp(newSelfhelp, true);
        }
        if (!page.logged_in && url != this.API_LOGIN && !url.includes('/validate') && !url.includes(this.API_RESET) && this.autoLoginAtempts == 0) {
            this.autoLoginAtempts++; // try to autologin only once
            this.autoLogin();
        }
        this.setSelfhelp(currSelfhelp, true);
    }

    private async autoLogin() {
        if (this.selfhelp.value.credentials) {
            const loginRes = await this.login(this.selfhelp.value.credentials, "Failed Auto Login!");
            if (!loginRes) {
                this.openUrl(this.API_LOGIN);
            }
        } else {
            this.openUrl(this.API_LOGIN);
        }
    }

    public login(loginValues: LoginValues, alert_fail: string): Promise<boolean> {
        let data = loginValues;
        data['type'] = 'login';
        return this.execServerRequest(this.API_LOGIN, data)
            .then((res: SelfHelpPageRequest) => {
                console.log('Login res', res);
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

    public register(regValues: RegistrationValues): Promise<RegistrationResult> {
        let data = regValues;
        data['type'] = 'register';
        return this.execServerRequest(this.API_LOGIN, data)
            .then((res: SelfHelpPageRequest) => {
                let currSelfhelp = this.selfhelp.value;
                console.log(res);
                const result = this.output_messages(res.content);
                if (currSelfhelp.logged_in != res.logged_in) {
                    currSelfhelp.logged_in = res.logged_in;
                    this.setSelfhelp(currSelfhelp, true);
                    this.getPage(currSelfhelp.navigation[0].url);
                    this.setNav(currSelfhelp.navigation[0].url);
                }
                return {
                    result: result,
                    url: res.redirect_url
                }
            })
            .catch((err) => {
                console.log(err);
                return {
                    result: false,
                    url: false
                };
            });
    }

    public validate(validateValues: ValidateValues, url: string): Promise<ValidationResult> {
        return this.execServerRequest(url, validateValues)
            .then((res: SelfHelpPageRequest) => {
                const result = this.output_messages(res.content);
                return {
                    result: result,
                    url: res.redirect_url
                }
            })
            .catch((err) => {
                console.log(err);
                return {
                    result: false,
                    url: false
                };
            });
    }

    public resetPassword(resetValues: ResetPasswordValues): Promise<ResetPasswordResult> {
        let data = resetValues;
        return this.execServerRequest(this.API_RESET, data)
            .then((res: SelfHelpPageRequest) => {
                return {
                    result: this.output_messages(res.content),
                    url: res.redirect_url,
                    selfhelp_res: res
                }
            })
            .catch((err) => {
                console.log(err);
                return {
                    result: false,
                    url: false,
                    selfhelp_res: null as unknown as SelfHelpPageRequest
                };
            });
    }

    public setNavigation(selfHelpNavigation: SelfHelpNavigation[]): void {
        if (!this.isEqual(selfHelpNavigation, this.selfhelp.value.navigation)) {
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
        this.selfhelp.next(selfhelp);
        if (contentChange) {
            this.saveLocalSelfhelp();
        }
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
            // console.log('change');
        }
        return res;
    }

    public getContent(nav: SelfHelpNavigation) {
        return this.selfhelp.value.urls[this.getUrl(nav)] ? this.selfhelp.value.urls[this.getUrl(nav)].content : null;
    }

    private getLocalSelfhelp() {
        Preferences.get({ key: this.local_selfhelp }).then((val) => {
            if (val.value) {
                let currSelfhelp = <SelfHelp>JSON.parse(val.value);
                currSelfhelp.current_modal_url = '';
                this.setSelfhelp(currSelfhelp, false);
                this.loadLanguage();
            }
        });
    }

    private saveLocalSelfhelp() {
        Preferences.set({
            key: this.local_selfhelp,
            value: JSON.stringify(this.selfhelp.value),
        });
    }

    private saveSelfhelpServer(server: string) {
        Preferences.set({
            key: this.selfhelp_server,
            value: server,
        });
    }

    public submitForm(keyword: string, params: any): Promise<boolean> {
        console.log('form params', params);
        return this.execServerRequest(keyword, params)
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    this.lastToastMsg = '';
                    if (!this.output_messages(res.content)) {
                        return false;
                    };
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
            if (style) {
                if (style.success_msgs) {
                    style.success_msgs.forEach(success_msg => {
                        if (this.lastToastMsg != success_msg) {
                            this.lastToastMsg = success_msg
                            this.presentToast(success_msg, 'success');
                        }
                    });
                }
                if (style.fail_msgs) {
                    res = false;
                    style.fail_msgs.forEach(fail_msg => {
                        if (this.lastToastMsg != fail_msg) {
                            this.lastToastMsg = fail_msg
                            this.presentToast(fail_msg, 'danger');
                        }
                    });
                }
                res = res && this.output_messages(style.children);
            }
        });
        return res;
    }

    // private getNativeParams(params): string {
    //     var prefix, s, add, name, r20, output;
    //     s = [];
    //     r20 = /%20/g;
    //     add = function (key, value) {
    //         // If value is a function, invoke it and return its value
    //         value = (typeof value == 'function') ? value() : (value == null ? "" : value);
    //         s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    //     };
    //     if (params instanceof Array) {
    //         for (name in params) {
    //             add(name, params[name]);
    //         }
    //     } else {
    //         for (prefix in params) {
    //             this.buildParams(prefix, params[prefix], add);
    //         }
    //     }
    //     output = s.join("&").replace(r20, "+");
    //     return output;
    // };

    // private buildParams(prefix, obj, add): void {
    //     var name, i, l, rbracket;
    //     rbracket = /\[\]$/;
    //     if (obj instanceof Array) {
    //         for (i = 0, l = obj.length; i < l; i++) {
    //             if (rbracket.test(prefix)) {
    //                 add(prefix, obj[i]);
    //             } else {
    //                 this.buildParams(prefix + "[" + (typeof obj[i] === "object" ? i : "") + "]", obj[i], add);
    //             }
    //         }
    //     } else if (typeof obj == "object") {
    //         // Serialize object item.
    //         for (name in obj) {
    //             this.buildParams(prefix + "[" + name + "]", obj[name], add);
    //         }
    //     } else {
    //         // Serialize scalar item.
    //         add(prefix, obj);
    //     }
    // }

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
                        // console.log('Close clicked');
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

    public savePdf(pdfLink: string) {
        // this.inAppBrowser.create(pdfLink, "_system");
    }

    public openUrl(url: string): boolean {
        if (this.selfhelp.value.urls[url]) {

            //
            this.getPage(url);
            if (!this.setNav(url)) {
                this.getModalPage(url);
            }
            // this.setSelectedMenu(this.selfhelp.value.urls[url]);
        } else if (this.isURL(url)) {
            // it is web link, open in the browser
            console.log('browser');
            if (url.match(".pdf")) {
                // this.inAppBrowser.create(url, "_system");
                this.getDocumentViewer(url);
            } else {
                // this.inAppBrowser.create(url);
            }
        } else {
            console.log('page');
            this.getPage(url);
            this.getModalPage(url);
        }
        return true;
    }

    private async getModalPage(url: string) {
        if (this.selfhelp.value.current_modal_url != url) {
            let curSelfhelp = this.selfhelp.value;
            curSelfhelp.current_modal_url = url;
            this.setSelfhelp(curSelfhelp, false);
            const modal = await this.modalController.create({
                component: ModalPageComponent,
                componentProps: {
                    url_param: url
                },
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
        delete currSelfhelp.credentials;
        this.setSelfhelp(currSelfhelp, true);
        await this.getPage(this.API_LOGIN);
        this.getPage(currSelfhelp.navigation[0].url); // set first tab on logout
    }

    public async getDeviceID(): Promise<string> {
        return this.isApp ? (await Device.getId()).identifier : "WEB";
    }

    public async getModalComponent(component: any) {
        const modal = await this.modalController.create({
            component: component,
            // swipeToClose: true,
            backdropDismiss: true,
            showBackdrop: true,
            cssClass: 'modal-fullscreen'
        });
        return await modal.present();
    }

    public async getDocumentViewer(url: string) {
        // const modal = await this.modalController.create({
        //     component: PdfViewerComponent,
        //     componentProps: {
        //         pdfUrl: url,
        //     },
        //     // swipeToClose: true,
        //     backdropDismiss: true,
        //     showBackdrop: true,
        //     cssClass: 'modal-fullscreen'
        // });
        // return await modal.present();
    }

    public getAvatarImg(): string {
        let currSelfhelp = this.selfhelp.value;
        if (currSelfhelp.avatar && !this.isURL(currSelfhelp.avatar)) {
            return this.getApiEndPointNative() + '/' + currSelfhelp.avatar;
        }
        return '';
    }

    async selectServer() {
        console.log('wait2w');
        let serversList = await this.getServers(this.API_SERVER_SELECTION);
        console.log(serversList);
        let servers: ValueItem[] = serversList.content[0]['items']['content'];
        console.log(servers);
        let inputs: any[] = [];
        servers.forEach(server => {
            inputs.push(
                {
                    name: server.text,
                    type: 'radio',
                    label: server.text,
                    value: server.value,
                }
            );
        });
        inputs[0]['checked'] = true;
        const alert = await this.alertController.create({
            cssClass: 'selectServer',
            header: 'Server',
            backdropDismiss: false,
            inputs: inputs,
            buttons: [
                {
                    text: 'Select',
                    handler: data => {
                        this.API_ENDPOINT_NATIVE = data;
                        this.saveSelfhelpServer(this.API_ENDPOINT_NATIVE);
                        this.utils.debugLog('Selected server is:', this.API_ENDPOINT_NATIVE);
                        this.loadApp();
                    }
                }
            ]
        });
        await alert.present();
    }

    public async getServers(url: string): Promise<SelfHelpPageRequest> {
        let params = {
            'mobile': "true",
            'device_id': await this.getDeviceID()
        };
        const options: HttpOptions = {
            url: url,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams(params).toString(),
            webFetchExtra: {
                credentials: "include",
            }
        };
        console.log('servers2', options);
        return new Promise((resolve, reject) => {
            CapacitorHttp.post(options).then(response => {
                console.log(response);
                resolve(JSON.parse(response.data));
            })
                .catch((err) => {
                    console.log(err);
                    reject(err); // Here.
                });
        });
    }

    public getIcon(value: string): string {
        if (!value) {
            return '';
        }
        const icons = value.split(' ');
        let res = '';
        icons.forEach(icon => {
            if (icon.startsWith('mobile-')) {
                res = icon.replace('mobile-', '');
            }
        });
        return res;
    }

    public loadLanguage() {
        let locale = this.selfhelp.value.locale ? this.selfhelp.value.locale : this.defaultAppLocale;
        this.translate.setDefaultLang(locale);
        this.translate.use(locale);
    }

    public resetLocalData() {
        Preferences.remove({ key: this.selfhelp_server });
        Preferences.remove({ key: this.local_selfhelp });
        Preferences.remove({ key: 'skin_app' });
    }

    public isFormField(field: any): boolean {
        return field.style_name &&
            (field.style_name == 'input' || field.style_name == 'radio' || field.style_name == 'select' || field.style_name == 'textarea');
    }

    public getFormField(formField: any): InputStyle | RadioStyle | SelectStyle | TextAreaStyle {
        switch (formField.style_name) {
            case 'input':
                return <InputStyle>formField;
            case 'radio':
                return <RadioStyle>formField;
            case 'select':
                return <SelectStyle>formField;
            case 'textarea':
                return <TextAreaStyle>formField;
            default:
                return formField;
        }
    }

    public getUserLanguage(): Language {
        if (this.selfhelp.value.languages) {
            return <Language>this.selfhelp.value.languages.find(lang => lang.id === this.selfhelp.value.user_language);
        } else {
            return {
                id: 1,
                locale: "de-de",
                title: "German"
            }
        }
    }

    public isURL(str: string): boolean {
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        return urlPattern.test(str);
    }

    public isNumeric(val: any) {
        return /^[0-9]+$/.test(val);
    }

    private getNativeParams(params: any): string {
        var prefix, s: any[], add, name, r20, output;
        s = [];
        r20 = /%20/g;
        add = function (key: string, value: any) {
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

    private buildParams(prefix: string, obj: any, add: any): void {
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

}
