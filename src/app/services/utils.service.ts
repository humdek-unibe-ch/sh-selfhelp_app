import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    // CODE PUSH ************************************

    // Build
    // ionic cordova build android --prod --release

    // appcenter codepush deployment add -a <ownerName>/<appName> Production
    // appcenter codepush deployment add -a TPF-UniBe/soapp-android Production
    // appcenter codepush deployment add -a TPF-UniBe/soapp-ios Production
    // appcenter codepush deployment list -k --app TPF-UniBe/soapp-android

    //1 ionic cordova prepare android --prod --release
    //1 ionic cordova prepare ios --prod --release
    //2 appcenter codepush release-cordova -a sk18u529-campus.unibe.ch/SelfHelp-android -d Production
    //2 appcenter codepush release-cordova -a TPF-UniBe/soapp-ios -d Production    
    //3 appcenter codepush  deployment history -a sk18u529-campus.unibe.ch/SelfHelp-android Production // check history of the versions
    //3 appcenter codepush  deployment history -a TPF-UniBe/soapp-ios Production

    // CODE PUSH ************************************

    private debugMode: boolean = false;

    constructor() { }

    public debugLog(text, obj: any): void {
        if (this.debugMode) {
            console.log('(debugLog)[' + moment().format('DD-MM-YYYY: H:mm:ss.SSS') + '] ' + text, obj);
        }
    }

    public getDebugMode(): boolean {
        return this.debugMode;
    }
}
