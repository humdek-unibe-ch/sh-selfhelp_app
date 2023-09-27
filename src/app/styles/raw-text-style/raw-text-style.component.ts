import { Component, Input, OnInit } from '@angular/core';
import { RawTextStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-raw-text-style',
    templateUrl: './raw-text-style.component.html',
    styleUrls: ['./raw-text-style.component.scss'],
})
export class RawTextStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: RawTextStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
