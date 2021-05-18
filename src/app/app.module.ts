import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP } from '@ionic-native/http/ngx';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { FormBuilder } from '@angular/forms';
import { CodePush } from '@ionic-native/code-push/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { NgCalendarModule } from 'ionic2-calendar';
import { registerLocaleData } from '@angular/common';
import { Calendar } from '@ionic-native/calendar/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/File/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { Media } from '@ionic-native/media/ngx';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import localeDe from '@angular/common/locales/de';
registerLocaleData(localeDe);

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        NgCalendarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AndroidFullScreen,
        HTTP,
        InAppBrowser,
        Device,
        AppVersion,
        FirebaseX,
        FormBuilder,
        CodePush,
        Deeplinks,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: LOCALE_ID, useValue: 'de-DE' },
        Calendar,
        MediaCapture,
        File,
        Media,
        StreamingMedia
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
