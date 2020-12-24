import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelfHelp, SelfHelpNavigation, SelfHelpPageRequest, LocalSelfhelp } from './../selfhelpInterfaces';
import { Storage } from '@ionic/storage';
declare var require: any;
var equal = require('fast-deep-equal');

@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private isApp: boolean = false;
    private local_selfhelp: LocalSelfhelp = 'selfhelp';
    public API_ENDPOINT = 'http://localhost/selfhelp';
    private selfhelp: BehaviorSubject<SelfHelp> = new BehaviorSubject<SelfHelp>({
        navigation: [],
        selectedMenu: null,
        selectedSubMenu: null,
        urls: {}
    });

    constructor(public http: HttpClient, public httpN: HTTP, private platform: Platform, private storage: Storage) {
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
     * @description Create native header for http request
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @returns {*}
     * @memberof SelfhelpService
     */
    private createHeaderN(): any {
        const res = {
            'Content-Type': 'application/json'
        };
        return res;
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
     * @date 2020-12-11
     * @private
     * @param {string} keyword
     * @param {*} params
     * @returns {Promise<any>}
     * @memberof SelfhelpService
     */
    private async execServerRequest(keyword: string, params: any): Promise<any> {
        // path
        // params
        // success
        // error
        if (this.getIsApp()) {
            // use native calls
            this.httpN.setDataSerializer('json');
            // this.httpN
            //     .post(this.API_ENDPOINT + config['path'], config['params'], this.createHeaderN())
            //     .then(
            //         response => {
            //             if (config['success']) {
            //                 config['success'](response.data);
            //             }
            //         },
            //         error => {
            //             if (config['error']) {
            //                 config['error'](error.error);
            //             }
            //         }
            //     );
        } else {
            //use http requests
            const headers = new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
            return new Promise((resolve, reject) => {
                this.http.post(this.API_ENDPOINT + keyword, this.getPostParams(params), { headers, withCredentials: true })
                    .toPromise()
                    .then(res => {
                        resolve(res);
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
    private getPostParams(value: any): string {
        let res = '';
        for (let key of Object.keys(value)) {
            if (res == '') {
                res = key + '=' + value[key].toString();
            } else {
                res = res + '&' + key + '=' + value[key].toString();
            }
        }
        return res;
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
    }

    public setNavigation(selfHelpNavigation: SelfHelpNavigation[]): void {
        if (!this.isEqual(selfHelpNavigation, this.selfhelp.value.navigation)) {
            console.log('setNavigation');
            let currSelfhelp = this.selfhelp.value;
            const init = currSelfhelp.navigation.length == 0;
            currSelfhelp.navigation = selfHelpNavigation;
            this.setSelfhelp(currSelfhelp, true);
            if (init) {
                this.initAllMenuContent();
            }
        }
    }
    isNavigationEqual(newNav: SelfHelpNavigation[], oldNav: SelfHelpNavigation[]): boolean {
        return true;
    }

    public getUrl(nav: SelfHelpNavigation): string {
        return nav.children.length > 0 ? nav.children[0].url : nav.url;
    }

    // private getAndInitMenuPage(url: string): void {
    //     let currSelhelp = this.selfhelp.value;
    //     if (subNavIndex) {
    //         this.getPageInit(currSelhelp.navigation[navIndex].children[subNavIndex].url).then((res: SelfHelpPageRequest) => {
    //             if (res) {
    //                 let subNavInit = this.selfhelp.value;
    //                 subNavInit.navigation[navIndex].children[subNavIndex].content = res.content;
    //                 this.setSelfhelp(subNavInit);
    //             }
    //         })
    //     } else {
    //         this.getPageInit(this.getUrl(currSelhelp.navigation[navIndex])).then((res: SelfHelpPageRequest) => {
    //             if (res) {
    //                 let navInit = this.selfhelp.value;
    //                 navInit.navigation[navIndex].content = res.content;
    //                 if (navInit.navigation[navIndex].children.length > 0) {
    //                     // first sub menu is in the menu, we can directly assign it here
    //                     navInit.navigation[navIndex].children[0].content = res.content;
    //                 }
    //                 this.setSelfhelp(navInit);
    //             }
    //         })
    //     }
    // }

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

    private async getPageInit(keyword: string): Promise<SelfHelpPageRequest> {
        return this.execServerRequest(keyword, { mobile: true })
            .then(res => {
                return res;
            })
            .catch((err) => {
                console.log(err);
                return null;
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
}
