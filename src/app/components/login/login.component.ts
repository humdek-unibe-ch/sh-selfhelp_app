import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent extends BasicComponentComponent implements OnInit {

    constructor(injector: Injector,zone: NgZone) {
        super(injector, zone);
        this.url = '/login';
    }

}
