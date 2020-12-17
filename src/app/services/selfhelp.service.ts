import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelfHelpPage } from './../selfhelpInterfaces';

@Injectable({
    providedIn: 'root'
})
export class SelfhelpService {

    private isApp: boolean = false;
    public API_ENDPOINT = 'http://localhost/selfhelp';
    private page: BehaviorSubject<SelfHelpPage> = new BehaviorSubject<SelfHelpPage>(null);

    constructor(public http: HttpClient, public httpN: HTTP, private platform: Platform) {
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.isApp = true;
            } else {
                this.isApp = false;
            }
        });
        this.getPage('/');
    }

    /**
     * @description Return observable for SelfHelp page, it will be used to detect changes
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @returns {Observable<SelfHelpPage>}
     * @memberof SelfhelpService
     */
    public observePage(): Observable<SelfHelpPage> {
        return this.page.asObservable();
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

    /**
     * @description Set page value
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelpPage} page
     * @memberof SelfhelpService
     */
    private setPage(page: SelfHelpPage): void {
        this.page.next(page);
    }

    /**
     * @description Get page from SelfHelp
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @param {string} keyword
     * @returns {Promise<void>}
     * @memberof SelfhelpService
     */
    public async getPage(keyword: string): Promise<void> {        
        this.execServerRequest(keyword, { mobile: true })
            .then(res => {
                this.setPage(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }

}
