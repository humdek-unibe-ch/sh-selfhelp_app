import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-app-version',
    templateUrl: './app-version.component.html',
    styleUrls: ['./app-version.component.scss'],
})
export class AppVersionComponent extends BasicComponentComponent implements OnInit {

    constructor(injector: Injector, zone: NgZone) {
        super(injector, zone);
    }

    override ngOnInit() { }

}
