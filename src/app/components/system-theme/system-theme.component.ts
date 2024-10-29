import { Component, OnInit } from '@angular/core';
import { theme } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-system-theme',
    templateUrl: './system-theme.component.html',
    styleUrls: ['./system-theme.component.scss'],
})
export class SystemThemeComponent implements OnInit {
    systemTheme: theme = 'auto';
    themes = [
        {
            "value": "light",
            "text": "Light"
        },
        {
            "value": "dark",
            "text": "Dark"
        },
        {
            "value": "auto",
            "text": "Auto"
        }
    ];

    constructor(private selfHelpService: SelfhelpService) { }

    ngOnInit() {
        this.systemTheme = this.selfHelpService.getLocalSystemThemeSettings();
    }

    // Listen for the toggle check/uncheck to toggle the dark palette
    setSystemTheme() {
        this.selfHelpService.saveSystemTheme(this.systemTheme);
        this.selfHelpService.setSystemTheme(this.selfHelpService.getSystemTheme());
    }

}
