import { Component, Input, OnInit } from '@angular/core';
import { ShortcutButtonStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';

@Component({
    selector: 'app-shortcut-button-style',
    templateUrl: './shortcut-button-style.component.html',
    styleUrls: ['./shortcut-button-style.component.scss'],
})
export class ShortcutButtonStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ShortcutButtonStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    /**
     * Executes a shortcut command based on the current mobile platform (iOS or Android).
     * If the mobile platform is iOS, it opens the specified iOS settings.
     * If the mobile platform is Android, it opens the specified Android settings.
     */
    public shortcutCommand(): void {
        let command!: IOSSettings | AndroidSettings;
        if (this.selfhelp.mobilePlatform === 'ios') {
            command = this.getFieldContent('shortcut_ios');
            NativeSettings.openIOS({
                option: <IOSSettings>command,
            });
        } else if (this.selfhelp.mobilePlatform === 'android') {
            command = this.getFieldContent('shortcut_android');
            NativeSettings.openAndroid({
                option: <AndroidSettings>command,
            });
        }
    }
}
