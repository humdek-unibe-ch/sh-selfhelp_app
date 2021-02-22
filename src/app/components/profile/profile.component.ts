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
        if (this.selfhelp.urls[this.url]) {
            for (let i = 0; i < this.selfhelp.urls[this.url].content.length; i++) {
                const style = this.selfhelp.urls[this.url].content[i];
                const prof = <ProfileStyle>style;
                if (prof.profile_title) {
                    return prof.profile_title;
                }
            }
        }
        return '';
    }

    public logout(): void{
        this.selfhelpService.logout();
        this.selfhelpService.closeModal();
    }
}
