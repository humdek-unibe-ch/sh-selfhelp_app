import { Component, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-dark-light-mode-toggle',
    templateUrl: './dark-light-mode-toggle.component.html',
    styleUrls: ['./dark-light-mode-toggle.component.scss'],
})
export class DarkLightModeToggleComponent implements OnInit {
    paletteToggle = false;

    constructor(private selfHelpService: SelfhelpService) { }

    ngOnInit() {
        this.paletteToggle = this.selfHelpService.getSystemTheme() === 'dark';
    }

    // Listen for the toggle check/uncheck to toggle the dark palette
    toggleChange(ev: any) {
        this.selfHelpService.setSystemTheme(ev.detail.checked ? 'dark' : 'light');
    }
}
