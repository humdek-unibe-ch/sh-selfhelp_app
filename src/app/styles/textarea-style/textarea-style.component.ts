import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TextAreaStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-textarea-style',
    templateUrl: './textarea-style.component.html',
    styleUrls: ['./textarea-style.component.scss'],
})
export class TextareaStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: TextAreaStyle;
    @Input() parentForm: FormGroup;

    constructor() {
        super();
    }

    ngOnInit() { }

}
