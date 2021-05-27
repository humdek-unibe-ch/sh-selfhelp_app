import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    // CODE PUSH ************************************

    // Build
    // ionic cordova build android --prod --release

    // appcenter codepush release-cordova -a TPF-UniBe/SelfHelp-ios -d Production

    // appcenter codepush deployment add -a <ownerName>/<appName> Production
    // appcenter codepush deployment add -a TPF-UniBe/SelfHelp-android Production
    // appcenter codepush deployment add -a TPF-UniBe/SelfHelp-ios Production
    // appcenter codepush deployment list -k --app TPF-UniBe/SelfHelp-android

    //1 ionic cordova prepare android --prod --release
    //1 ionic cordova prepare ios --prod --release
    //2 appcenter codepush release-cordova -a sk18u529-campus.unibe.ch/SelfHelp-android -d Production
    //2 appcenter codepush release-cordova -a TPF-UniBe/SelfHelp-ios -d Production    
    //3 appcenter codepush  deployment history -a sk18u529-campus.unibe.ch/SelfHelp-android Production // check history of the versions
    //3 appcenter codepush  deployment history -a TPF-UniBe/SelfHelp-ios Production

    // CODE PUSH ************************************

    // iOS livereload debug
    // ionic cordova run ios --buildFlag="-UseModernBuildSystem=0" --livereload

    private debugMode: boolean = true;

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
