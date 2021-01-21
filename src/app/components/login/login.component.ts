import { Component, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BasicComponentComponent implements OnInit {

    constructor(selfhelpService: SelfhelpService) {
        super(selfhelpService);
        this.url = '/login'
    }

}
