import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    // CODE PUSH ************************************

    // Build
    // ionic cordova build android --prod --release
    // ionic cordova build android --prod --release -- -- --packageType=bundle 
    // cd .\platforms\android\ then ./gradlew bundle // this will generate .AAB bundle then sign it

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

    // LOCAL CODE PUSH
    // code-push login https://codepush.philhum.unibe.ch
    // code-push app add SelfHelp-android android cordova
    // code-push deployment list -k  SelfHelp-android // show deployment keys
    // ionic cordova prepare android --prod --release
    // ionic cordova prepare android // this one works better, check size
    // code-push  deployment history -a SelfHelp-android Production
    // code-push release-cordova SelfHelp-android android -d Production --mandatory true --des "v2.0.7"     
    // code-push deployment clear SelfHelp-android Production

    //      IOS    
    // code-push app add SelfHelp-ios ios cordova
    // ionic cordova prepare ios  --prod --release // this one works better, check size
    // code-push  deployment history -a SelfHelp-ios Production
    // code-push release-cordova SelfHelp-ios ios -d Production --mandatory true     
    // code-push deployment clear SelfHelp-ios Production


    // EPERM or any blocking process -- kill java from task manager

    // CODE PUSH SOAPP PLUS ANDROID
    // code-push  deployment history -a Soapp-Plus-android Production
    // ionic cordova prepare android --prod --release
    // code-push release-cordova Soapp-Plus-android android -d Production --mandatory true  
    // code-push deployment clear Soapp-Plus-android Production

     // CODE PUSH SOAPP PLUS IOS
    // code-push  deployment history -a Soapp-Plus-ios Production
    // ionic cordova prepare ios --prod --release
    // code-push release-cordova Soapp-Plus-ios ios -d Production --mandatory true  
    // code-push deployment clear Soapp-Plus-ios Production

    // Local test with ip and ssl
    // ionic serve --external --ssl
    // Build SelfHelpMobilePreview
    // ng build --base-href "/SelfHelpMobilePreview/" --deploy-url "/SelfHelpMobilePreview/"

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
