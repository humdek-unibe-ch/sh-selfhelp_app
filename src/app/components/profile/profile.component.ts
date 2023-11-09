import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';
import { ProfileStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent extends BasicComponentComponent implements OnInit {

    constructor(injector: Injector,zone: NgZone) {
        super(injector, zone);
        this.url = '/profile'
    }

    public getProfileTitle(): string {
        if (this.selfHelp.urls[this.url]) {
            return this.selfHelp.urls[this.url]['title'];
        }
        return '';
    }

    public logout(): void{
        this.selfHelpService.logout();
        this.selfHelpService.closeModal('submit');
    }
}
