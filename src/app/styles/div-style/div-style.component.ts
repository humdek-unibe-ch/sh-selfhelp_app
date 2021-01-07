import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { Style } from '../../selfhelpInterfaces';

@Component({
    selector: 'app-div-style',
    templateUrl: './div-style.component.html',
    styleUrls: ['./div-style.component.scss'],
})
export class DivStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: Style;

    constructor() {
        super();
    }

    ngOnInit() { }

}
