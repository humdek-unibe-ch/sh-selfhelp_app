import { Component, Input, OnInit } from '@angular/core';
import { FigureStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-figure-style',
    templateUrl: './figure-style.component.html',
    styleUrls: ['./figure-style.component.scss'],
})
export class FigureStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: FigureStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
