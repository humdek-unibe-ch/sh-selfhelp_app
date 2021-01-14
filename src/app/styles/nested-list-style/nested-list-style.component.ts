import { Component, Input, OnInit } from '@angular/core';
import { NestedListStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-nested-list-style',
    templateUrl: './nested-list-style.component.html',
    styleUrls: ['./nested-list-style.component.scss'],
})
export class NestedListStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: NestedListStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
