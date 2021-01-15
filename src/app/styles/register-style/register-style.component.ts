import { Component, Input, OnInit } from '@angular/core';
import { RegisterStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-register-style',
    templateUrl: './register-style.component.html',
    styleUrls: ['./register-style.component.scss'],
})
export class RegisterStyleComponen extends BasicStyleComponent implements OnInit {
    @Input() style: RegisterStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
