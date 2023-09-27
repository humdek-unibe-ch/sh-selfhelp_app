import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { HeadingStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-heading-style',
    templateUrl: './heading-style.component.html',
    styleUrls: ['./heading-style.component.scss'],
})
export class HeadingStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: HeadingStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
