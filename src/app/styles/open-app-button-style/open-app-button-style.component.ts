import { Component, Input, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { OpenAppButtonStyle } from 'src/app/selfhelpInterfaces';
import { AppLauncher, OpenURLResult } from '@capacitor/app-launcher';

@Component({
    selector: 'app-open-app-button-style',
    templateUrl: './open-app-button-style.component.html',
    styleUrls: ['./open-app-button-style.component.scss'],
})
export class OpenAppButtonStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: OpenAppButtonStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    /**
     * @description  Opens the mobile application by attempting to launch its URL, and falls back to opening the installation link
     * if the app cannot be opened.
     * @author Stefan Kodzhabashev
     * @date 08/01/2024
     * @memberof OpenAppButtonStyleComponent
     */
    public async openApp() {
        if (await AppLauncher.canOpenUrl({
            url: this.getFieldContent('app_url')
        })) {
            await AppLauncher.openUrl({
                url: this.getFieldContent('app_url')
            }).then((res: OpenURLResult) => {
                if (!res.completed) {
                    this.openInstallationLink();
                }
            });
        } else {
            this.openInstallationLink();
        }
    }

    /**
     * @description Opens the installation link for the mobile application based on the current platform (iOS or Android).
     * If the installation link is available for the platform, it launches the link in the default browser.
     * @author Stefan Kodzhabashev
     * @date 08/01/2024
     * @private
     * @memberof OpenAppButtonStyleComponent
     */
    private openInstallationLink() {
        let installationLink;
        if (this.selfhelp.mobilePlatform === 'ios') {
            installationLink = this.getFieldContent('installation_ios_url');
        } else if (this.selfhelp.mobilePlatform === 'android') {
            installationLink = this.getFieldContent('installation_android_url');
        }
        if (installationLink) {
            AppLauncher.openUrl({
                url: installationLink
            });
        }
    }

}
