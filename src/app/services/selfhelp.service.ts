import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SelfHelp, SelfHelpNavigation, SelfHelpPageRequest, LocalSelfhelp, Styles } from './../selfhelpInterfaces';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private isApp: boolean = false;
    private local_selfhelp: LocalSelfhelp = 'selfhelp';
    private API_ENDPOINT_NATIVE = 'http://178.38.58.178/selfhelp';
    private API_ENDPOINT_WEB = 'http://localhost/selfhelp';
    private API_LOGIN = '/login';
    private selfhelp: BehaviorSubject<SelfHelp> = new BehaviorSubject<SelfHelp>({
        navigation: [],
        selectedMenu: null,
        selectedSubMenu: null,
        urls: {},
        logged_in: null
    });
    private initApp = false;
    private messageDuration = 2000;

    constructor(public http: HttpClient, public httpN: HTTP, private platform: Platform, private storage: Storage, public toastController: ToastController) {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.isApp = true;
            } else {
                this.isApp = false;
            }
            this.getLocalSelfhelp();
            this.getPage('/');
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
     * @private
     * @param {string} keyword
     * @param {*} params
     * @returns {Promise<SelfHelpPageRequest>}
     * @memberof SelfhelpService
     */
    private async execServerRequest(keyword: string, params: any): Promise<SelfHelpPageRequest> {
        if (this.getIsApp()) {
            // use native calls
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
                            console.log(error);
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

    private setPage(url: string, page: SelfHelpPageRequest): void {
        this.setNavigation(page.navigation);
        let urlFound = false;
        let currSelfhelp = this.selfhelp.value;
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
            this.setSelfhelp(newSelfhelp, true);
        }
        if (!page.logged_in) {
            this.autoLogin();
        }
    }

    private autoLogin() {
        console.log('try auto login');
        this.login('redwater@abv.bg', 'q1w2e3r4'); 
        // this.login('tpf', 'h2QPK2fJ_WNca6W$');
    }

    private login(email: string, password: string) {
        this.execServerRequest(this.API_LOGIN, {
            mobile: true,
            type: 'login',
            email: email,
            password: password
        })
            .then((res: SelfHelpPageRequest) => {
                console.log('login', res);
                let currSelfhelp = this.selfhelp.value;
                if (currSelfhelp.logged_in != res.logged_in) {
                    currSelfhelp.logged_in = res.logged_in;
                    this.setSelfhelp(currSelfhelp, true);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    public setNavigation(selfHelpNavigation: SelfHelpNavigation[]): void {
        if (!this.isEqual(selfHelpNavigation, this.selfhelp.value.navigation)) {
            console.log('setNavigation');
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
        this.execServerRequest(keyword, { mobile: true })
            .then((res: SelfHelpPageRequest) => {
                if (res) {
                    this.setPage(keyword, res);
                }
            })
            .catch((err) => {
                console.log(err);
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

    private output_messages(content: Styles) {
        content.forEach(style => {
            if (style.success_msgs) {
                style.success_msgs.forEach(success_msg => {
                    this.presentToast(success_msg, 'success');
                });
            }
            if (style.fail_msgs) {
                console.log(style.fail_msgs);
                style.fail_msgs.forEach(fail_msg => {
                    this.presentToast(fail_msg, 'danger');
                });
            }
            this.output_messages(style.children);
        });
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

}
