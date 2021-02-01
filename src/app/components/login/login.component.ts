import { Component, Injector, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BasicComponentComponent implements OnInit {

    constructor(injector: Injector) {
        super(injector);
        this.url = '/login'
    }

}
