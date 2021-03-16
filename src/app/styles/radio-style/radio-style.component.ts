import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RadioStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-radio-style',
    templateUrl: './radio-style.component.html',
    styleUrls: ['./radio-style.component.scss'],
})

export class RadioStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: RadioStyle;
    @Input() parentForm: FormGroup;

    constructor() {
        super();
    }

    ngOnInit() { }

}
