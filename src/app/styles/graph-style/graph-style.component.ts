import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { GraphStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-graph-style',
    templateUrl: './graph-style.component.html',
    styleUrls: ['./graph-style.component.scss'],
})
export class GraphStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: GraphStyle;

    constructor() {
        super();
    }

    ngOnInit() {
        console.log(this.style);
     }

}
