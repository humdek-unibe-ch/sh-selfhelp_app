import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { InputStyle } from 'src/app/selfhelpInterfaces';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-input-style',
    templateUrl: './input-style.component.html',
    styleUrls: ['./input-style.component.scss'],
})

export class InputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: InputStyle;
    @Input() parentForm: FormGroup;

    constructor() {
        super();
    }

    ngOnInit() { }

}