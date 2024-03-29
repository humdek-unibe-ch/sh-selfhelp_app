import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy, isPlatform } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import localeDe from '@angular/common/locales/de';
import { SkinApp } from './selfhelpInterfaces';
import { MobilePreviewComponent } from './mobile-preview/mobile-preview.component';
import { SurveyModule } from "survey-angular-ui";
import { AppComponent } from './app.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxColorsModule } from 'ngx-colors';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
registerLocaleData(localeDe);

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function getAppSkin(): SkinApp {
    if (isPlatform('ios')) {
        return 'ios';
    } else if (isPlatform('android')) {
        return 'md'
    }
    else {
        let skin_app = window.localStorage.getItem('skin_app');
        if (!skin_app) {
            skin_app = 'ios';
        }
        return skin_app as SkinApp;
    }
}

@NgModule({
    declarations: [
        AppComponent,
        MobilePreviewComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot({
            mode: getAppSkin(),
            innerHTMLTemplatesEnabled: true
        }),
        AppRoutingModule,
        HttpClientModule,
        SurveyModule,
        FullCalendarModule,
        NgxColorsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
    ],
    providers: [
        FormBuilder,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: LOCALE_ID, useValue: 'de-DE' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
