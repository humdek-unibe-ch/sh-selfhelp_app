import { Component, Input, OnInit } from '@angular/core';
import { ProfileStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-profile-style',
    templateUrl: './profile-style.component.html',
    styleUrls: ['./profile-style.component.scss'],
})
export class ProfileStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ProfileStyle;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }


    ngOnInit() { }

    getAppVersion(): string {
        return this.selfhelpService.appVersion;
    }

    getAppBuildVersion(): string {
        return this.selfhelpService.appBuildVersion;
    }

}
