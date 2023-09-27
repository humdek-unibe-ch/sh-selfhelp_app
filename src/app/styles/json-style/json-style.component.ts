import { Component, Input, OnInit } from '@angular/core';
import { JsonStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-json-style',
    templateUrl: './json-style.component.html',
    styleUrls: ['./json-style.component.scss'],
})
export class JsonStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: JsonStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
