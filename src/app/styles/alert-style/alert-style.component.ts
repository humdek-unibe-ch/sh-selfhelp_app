import { Component, Input, OnInit } from '@angular/core';
import { AlertStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-alert-style',
    templateUrl: './alert-style.component.html',
    styleUrls: ['./alert-style.component.scss'],
})
export class AlertStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: AlertStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
