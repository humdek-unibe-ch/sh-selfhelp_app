import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ProfileStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-profile-style',
    templateUrl: './profile-style.component.html',
    styleUrls: ['./profile-style.component.scss'],
})
export class ProfileStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ProfileStyle;

    constructor() {
        super();
    }


    ngOnInit() { }

}
