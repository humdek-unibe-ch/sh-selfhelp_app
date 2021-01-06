import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-select-style',
    templateUrl: './select-style.component.html',
    styleUrls: ['./select-style.component.scss'],
})
export class SelectStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: SelectStyle;
    @Input() parentForm: FormGroup;

    constructor() {
        super();
    }

    ngOnInit() { 
        console.log(this.style);
    }

}
