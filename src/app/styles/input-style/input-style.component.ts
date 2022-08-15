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

    ngOnInit() { 
        console.log(this.style);
    }

    formatDate(controlName){
        this.parentForm.controls[controlName].setValue(this.parentForm.controls[controlName].value.split('T')[0]);
    }

    formatDateTime(controlName){
        if(this.parentForm.controls[controlName].value.includes('+')){
            let time = this.parentForm.controls[controlName].value.split('+')[0];
            console.log(time.split('T')[0] + " " + time.split('T')[1]);
            this.parentForm.controls[controlName].setValue(time.split('T')[0] + " " + time.split('T')[1]);
        }
    }


}