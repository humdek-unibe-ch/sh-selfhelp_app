import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-app-version',
    templateUrl: './app-version.component.html',
    styleUrls: ['./app-version.component.scss'],
})
export class AppVersionComponent extends BasicComponentComponent implements OnInit {

    constructor(injector: Injector, zone: NgZone, selfhelpService: SelfhelpService) {
        super(injector, zone);
    }

    override ngOnInit() { }

}
